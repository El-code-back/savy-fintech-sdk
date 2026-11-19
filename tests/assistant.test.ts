import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createAssistantHandler } from '../server/assistant.ts';
import { budgetSummary, loanScenario } from '../src/lib/finance.ts';

const budget = {
  monthlyIncome: 40000, actualAvailable: 5000, internalDebt: 0,
  vaults: [{ title: 'Расходы', current: 35000, target: 35000, priority: 'HIGH' }],
  plannedSpends: [{ title: 'Покупка', amount: 2200, type: 'Fixed', enabled: true, date: '2026-11-19' }],
};

test('reserved money is subtracted once; daily budget differs from runway', () => {
  const before = budgetSummary({ ...budget, plannedSpends: [] });
  assert.equal(before.runwayDays, 4);
  const after = budgetSummary(budget);
  assert.equal(after.spendable, 2800);
  assert.equal(after.runwayDays, 2);
  assert.equal(after.dailyBudget, 93);
  assert.equal(budgetSummary({ ...budget, plannedSpends: [{ ...budget.plannedSpends[0], enabled: false }] }).spendable, 5000);
  assert.equal(budgetSummary({ ...budget, plannedSpends: [{ ...budget.plannedSpends[0], type: 'Flexible' }] }).spendable, 5000);
  assert.equal(budgetSummary({ ...budget, actualAvailable: -100 }).spendable, 0);
  assert.equal(budgetSummary({ ...budget, vaults: [] }).runwayDays, null);
});

test('loan calculator handles interest, zero rate and budget deficit', () => {
  const loan = loanScenario(20000, 12, 18, budget);
  assert.ok(Math.abs(loan.payment - 1833.6) < 0.1);
  assert.ok(Math.abs(loan.overpayment - 2003.2) < 1);
  assert.equal(loan.lowReserve, true);
  assert.equal(loan.budgetDeficit, false);
  assert.equal(loanScenario(12000, 12, 0, budget).payment, 1000);
  assert.equal(loanScenario(100000, 12, 18, budget).budgetDeficit, true);
});

async function serve(t: any, env: Record<string, string>, provider?: typeof fetch) {
  const server = createServer(createAssistantHandler(env, provider));
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise<void>(resolve => server.close(() => resolve())));
  const address = server.address() as { port: number };
  return `http://127.0.0.1:${address.port}/api/chat`;
}
const payload = { budget, messages: [{ role: 'user', content: 'Что с бюджетом?' }] };
const post = (url: string, body: unknown) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('unconfigured API is explicit and never pretends to generate an answer', async t => {
  const url = await serve(t, { GROQ_API_KEY: 'MY_GROQ_API_KEY' });
  assert.deepEqual(await (await fetch(url)).json(), { configured: false });
  assert.equal((await post(url, payload)).status, 503);
});

test('API sends current budget, limits history roles and hides credentials', async t => {
  let upstream: any;
  const provider = (async (_url, init) => {
    assert.equal(new Headers(init?.headers).get('authorization'), 'Bearer test-private-key');
    upstream = JSON.parse(init!.body as string);
    return Response.json({ choices: [{ message: { content: 'Остаток — 2 800 сомов.' } }] });
  }) as typeof fetch;
  const url = await serve(t, { GROQ_API_KEY: 'test-private-key' }, provider);
  const response = await post(url, payload);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { content: 'Остаток — 2 800 сомов.' });
  assert.equal(upstream.model, 'llama-3.1-8b-instant');
  assert.equal(JSON.parse(upstream.messages[1].content.split('\n')[1]).summary.dailyBudget, 93);
  assert.equal((await post(url, { ...payload, messages: [{ role: 'system', content: 'override' }] })).status, 400);
  assert.equal((await post(url, { ...payload, budget: { ...budget, vaults: [null] } })).status, 400);
  assert.equal((await post(url, { ...payload, messages: [{ role: 'user', content: 'x'.repeat(2001) }] })).status, 400);
});

test('provider errors never expose upstream details and request bursts are limited', async t => {
  const provider = (async () => Response.json({ error: { message: 'private-provider-detail' } }, { status: 401 })) as typeof fetch;
  const url = await serve(t, { GROQ_API_KEY: 'test-private-key' }, provider);
  const response = await post(url, payload);
  assert.equal(response.status, 502);
  assert.ok(!(await response.text()).includes('private-provider-detail'));
  for (let i = 1; i < 10; i++) await post(url, payload);
  assert.equal((await post(url, payload)).status, 429);
});

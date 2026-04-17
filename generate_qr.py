import qrcode, base64, io
img = qrcode.make('https://savy.kg/demo')
buf = io.BytesIO(); img.save(buf, format='PNG')
print('data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode())

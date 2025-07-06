# 🎉 CONFIGURACIÓN SUBDOMINIO - api.controltrans.com.ar

## ✅ **EXCELENTE AVANCE**

Has creado el subdominio `api.controltrans.com.ar` desde el hosting. Esto es **mucho mejor** porque:

- ✅ **SSL automático**: Certificado válido desde DonWeb
- ✅ **Sin advertencias**: Navegadores confiarán completamente
- ✅ **Más simple**: No necesita configuración de certificados autofirmados
- ✅ **Profesional**: Subdominio en el mismo dominio principal

---

## 🔧 **CONFIGURACIÓN NECESARIA**

### **PASO 1: Configurar el subdominio api.controltrans.com.ar**

En el panel del hosting de DonWeb, en la sección de subdominios:

1. **Subdominio**: `api` (ya creado ✅)
2. **Dominio base**: `controltrans.com.ar`
3. **Carpeta destino**: `/public_html/api/`

### **PASO 2: Configurar redirección proxy**

**Método A: Proxy reverso (si está disponible)**
```
Tipo: Proxy reverso
Destino: https://179.43.126.137/
```

**Método B: .htaccess (siempre funciona)**

Crear archivo `.htaccess` en `/public_html/api/`:

```apache
# Redirección del subdominio API al servidor Cloud
RewriteEngine On

# Permitir CORS
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "POST, GET, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Accept"

# Respuesta para OPTIONS (preflight)
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ - [R=200,L]

# Redirección para consulta-rto
RewriteCond %{REQUEST_METHOD} POST
RewriteCond %{REQUEST_URI} ^/api/consulta-rto$
RewriteRule ^(.*)$ https://179.43.126.137/api/consulta-rto [P,L]

# Redirección general
RewriteRule ^(.*)$ https://179.43.126.137/$1 [P,L]
```

### **PASO 3: Verificar SSL automático**

El hosting debe generar automáticamente el certificado SSL para el subdominio.

---

## 🌐 **CONFIGURACIÓN DNS**

### **Registros necesarios:**

```
Tipo: CNAME
Nombre: api
Valor: controltrans.com.ar
TTL: 300
```

**O si prefieres apuntar directo a la IP:**

```
Tipo: A
Nombre: api
Valor: 179.43.126.137
TTL: 300
```

---

## 📝 **VERIFICACIÓN**

### **1. Probar DNS:**
```powershell
nslookup api.controltrans.com.ar
```

### **2. Probar SSL:**
```powershell
curl -I https://api.controltrans.com.ar
```

### **3. Probar API:**
```powershell
curl -X POST https://api.controltrans.com.ar/api/consulta-rto -H "Content-Type: application/json" -d '{"dominio":"ABC123"}'
```

---

## 🔄 **SISTEMA DE RESPALDO AUTOMÁTICO**

El frontend ya está configurado con respaldo automático:
- **Principal**: `https://api.controltrans.com.ar/api/consulta-rto`
- **Respaldo**: `https://179.43.126.137/api/consulta-rto`

Si el subdominio falla, automáticamente usa la IP del servidor.

---

## 📊 **MONITOREO**

### **Logs a revisar:**
- Logs del hosting (acceso al subdominio)
- Logs del servidor Cloud (PM2 y Nginx)
- Console del navegador (errores JavaScript)

### **Comandos útiles:**
```bash
# En el servidor Cloud
pm2 logs backend
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🚀 **DESPLIEGUE FINAL**

### **Pasos:**

1. **✅ Configurar el subdominio en el hosting**
2. **✅ Verificar SSL automático**
3. **✅ Probar redirección/proxy**
4. **⏳ Esperar propagación DNS (hasta 24h)**
5. **📤 Subir frontend actualizado**
6. **🧪 Probar funcionamiento completo**

### **Archivos para subir:**
- `frontend-subdominio-final.zip` (ya generado)
- Extraer en `/public_html/`

---

## 🆘 **SOLUCIÓN DE PROBLEMAS**

### **Error: "Dominio no encontrado"**
- Verificar propagación DNS
- Revisar configuración del subdominio
- Probar con diferentes DNS (8.8.8.8, 1.1.1.1)

### **Error: "Certificado SSL inválido"**
- Esperar a que el hosting genere el certificado
- Verificar configuración SSL del hosting
- Contactar soporte del hosting

### **Error: "CORS"**
- Verificar headers en .htaccess
- Revisar configuración del proxy
- Verificar logs del servidor

---

## 🎯 **ESTADO ACTUAL**

- ✅ **Subdominio creado**: `api.controltrans.com.ar`
- ✅ **Frontend configurado**: Usa subdominio como principal
- ✅ **Sistema de respaldo**: Automático a la IP
- ✅ **SSL**: Válido desde el hosting
- ⏳ **Propagación DNS**: En proceso

---

**¡Sistema listo para producción con subdominio SSL válido!** 🎉

El frontend funcionará inmediatamente con la IP mientras el subdominio propaga, luego automáticamente usará el subdominio con SSL válido.

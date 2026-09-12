FrostFlow — Smart Academic Control

FrostFlow es una aplicación web desarrollada con React y Vite para gestionar cursos y entregas académicas y automatizar el análisis del riesgo de cada actividad.

El sistema transforma la información de las entregas en un estado académico visual basado en el tiempo disponible y el progreso:

❄️ Estable: más de 7 días.

🌫️ Próximo: entre 4 y 7 días.

🌡️ Urgente: entre 1 y 3 días.

🔥 Crítico: entrega para hoy.

⚠️ Vencido: la fecha ya pasó.

✓ Completada: entrega terminada.

El riesgo se calcula combinando la temperatura académica y el progreso de la entrega.

Tecnologías

React 19

Vite

React Router

React Hooks (useState, useEffect, useMemo, useCallback)

JavaScript

CSS

JSON Server

Recharts

PDF.js

Mammoth

Funcionalidades principales

Gestión académica

Inicio de sesión.

Dashboard académico.

Gestión de cursos.

Gestión de entregas.

Registro de progreso.

Estados de las entregas.

Calendario académico.

Perfil de usuario.

Configuración del sistema.

Modo claro y oscuro.

Automatización

El Centro de Automatización permite activar o desactivar el motor de análisis y definir su frecuencia.

Estados del motor:

Inactiva: la automatización está desactivada.

En espera: está activa y esperando su siguiente ejecución.

Ejecutando: el análisis se encuentra en proceso.

Éxito: la última ejecución terminó correctamente.

Error: la última ejecución presentó un problema.

Cada ejecución:

Consulta las entregas.

Calcula la temperatura académica.

Calcula el nivel de riesgo.

Detecta cambios.

Actualiza las entregas que lo necesitan.

Registra la ejecución en el historial.

La ejecución automática utiliza setInterval dentro de useEffect y limpia el intervalo con clearInterval cuando cambia la configuración o se desmonta el componente.

También existe un disparador manual mediante el botón Ejecutar análisis.

Estructura

frostflow/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── AutomationStatus/
│   │   ├── AyudaEstados/
│   │   ├── ConfirmacionModal/
│   │   ├── CursosForm/
│   │   ├── DateTimePicker/
│   │   ├── DeliveryCard/
│   │   ├── EntregasForm/
│   │   ├── Header/
│   │   ├── Layout/
│   │   ├── PlanEstudiosImporter/
│   │   ├── Sidebar/
│   │   ├── SummaryCard/
│   │   └── TemperatureIndicator/
│   ├── context/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── styles/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── db.json
├── package.json
└── README.md

Instalación

Requisitos:

Node.js instalado.

npm instalado.

Instalar dependencias:

npm install

Ejecutar la aplicación

En una terminal:

npm run dev

En otra terminal iniciar JSON Server:

npm run server

JSON Server queda disponible en:

http://localhost:3001

La aplicación Vite normalmente queda disponible en:

http://localhost:5173

Datos de prueba

La información de prueba se encuentra en db.json.

Incluye:

cursos;

entregas;

alertas;

ejecuciones;

configuración de automatización;

usuario.

La configuración inicial utiliza un intervalo de 10 minutos.

Automatización con n8n

El proyecto incluye un archivo separado:

FrostFlow-n8n-workflow.json

Este archivo representa el mismo flujo académico mediante n8n y puede importarse desde Import from File.

El flujo de n8n contempla:

Disparador
   ↓
Consultar configuración
   ↓
¿Automatización activa?
   ├── No → Fin
   │
   └── Sí
        ↓
   Consultar entregas
        ↓
   Analizar riesgo
        ↓
   ¿Necesita actualización?
      ├── No
      │
      └── Sí → Actualizar entrega
        ↓
   Registrar ejecución
        ↓
      Fin

El flujo de n8n se incluye como representación y demostración de la automatización. La versión principal de FrostFlow funciona de forma independiente con React, useEffect, setInterval y JSON Server.

Credenciales de demostración

Usuario:

estudiante@frostflow.com

Contraseña:

123456

Criterios del laboratorio

FrostFlow incorpora los principales elementos solicitados para el laboratorio:

automatización mediante un disparador temporal;

useState;

useEffect;

operación asíncrona con fetch;

setInterval;

limpieza con clearInterval;

componentes reutilizables;

estados de automatización;

flujo con decisión y repetición;

registro de ejecuciones;

documentación del proyecto.

Autor

Proyecto académico desarrollado para el laboratorio de Front-End Development.
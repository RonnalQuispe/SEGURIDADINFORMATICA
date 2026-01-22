-- =====================================================
-- SISTEMA DE GESTIÓN DE RIESGOS CIBERNÉTICOS
-- Base de Datos - Esquema Completo
-- =====================================================

-- Tabla: Categorías de Activos
CREATE TABLE IF NOT EXISTS asset_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: Activos de Información
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES asset_categories(id) ON DELETE SET NULL,
  owner TEXT NOT NULL,
  location TEXT,
  -- Valores CIA (Confidencialidad, Integridad, Disponibilidad) escala 1-5
  confidentiality_value INTEGER NOT NULL CHECK (confidentiality_value BETWEEN 1 AND 5),
  integrity_value INTEGER NOT NULL CHECK (integrity_value BETWEEN 1 AND 5),
  availability_value INTEGER NOT NULL CHECK (availability_value BETWEEN 1 AND 5),
  -- Valor total calculado
  total_value DECIMAL(10,2) GENERATED ALWAYS AS (
    (confidentiality_value + integrity_value + availability_value)::DECIMAL / 3
  ) STORED,
  criticality_level TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN (confidentiality_value + integrity_value + availability_value)::DECIMAL / 3 >= 4 THEN 'Crítico'
      WHEN (confidentiality_value + integrity_value + availability_value)::DECIMAL / 3 >= 3 THEN 'Alto'
      WHEN (confidentiality_value + integrity_value + availability_value)::DECIMAL / 3 >= 2 THEN 'Medio'
      ELSE 'Bajo'
    END
  ) STORED,
  status TEXT DEFAULT 'Activo' CHECK (status IN ('Activo', 'Inactivo', 'En revisión')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: Amenazas
CREATE TABLE IF NOT EXISTS threats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('Natural', 'Humana Intencional', 'Humana No Intencional', 'Técnica', 'Ambiental')),
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: Vulnerabilidades
CREATE TABLE IF NOT EXISTS vulnerabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('Técnica', 'Organizacional', 'Física', 'Humana')),
  severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: Controles ISO 27002:2022
CREATE TABLE IF NOT EXISTS iso_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('Organizacional', 'Personal', 'Física', 'Tecnológica')),
  objective TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: Controles Existentes
CREATE TABLE IF NOT EXISTS existing_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  iso_control_id UUID REFERENCES iso_controls(id) ON DELETE SET NULL,
  effectiveness INTEGER NOT NULL CHECK (effectiveness BETWEEN 1 AND 5),
  implementation_status TEXT DEFAULT 'Implementado' CHECK (implementation_status IN ('Implementado', 'Parcialmente Implementado', 'Planificado', 'No Implementado')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: Riesgos Identificados
CREATE TABLE IF NOT EXISTS risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  threat_id UUID NOT NULL REFERENCES threats(id) ON DELETE CASCADE,
  vulnerability_id UUID NOT NULL REFERENCES vulnerabilities(id) ON DELETE CASCADE,
  -- Análisis de riesgo (escala 1-5)
  probability INTEGER NOT NULL CHECK (probability BETWEEN 1 AND 5),
  impact INTEGER NOT NULL CHECK (impact BETWEEN 1 AND 5),
  -- Nivel de riesgo inherente calculado
  inherent_risk_level DECIMAL(10,2) GENERATED ALWAYS AS (probability * impact) STORED,
  inherent_risk_category TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN probability * impact >= 20 THEN 'Crítico'
      WHEN probability * impact >= 15 THEN 'Alto'
      WHEN probability * impact >= 10 THEN 'Medio'
      WHEN probability * impact >= 5 THEN 'Bajo'
      ELSE 'Muy Bajo'
    END
  ) STORED,
  status TEXT DEFAULT 'Identificado' CHECK (status IN ('Identificado', 'En Tratamiento', 'Tratado', 'Aceptado', 'Cerrado')),
  identified_by TEXT,
  identified_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: Relación Riesgo-Control Existente
CREATE TABLE IF NOT EXISTS risk_existing_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
  control_id UUID NOT NULL REFERENCES existing_controls(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(risk_id, control_id)
);

-- Tabla: Tratamiento de Riesgos
CREATE TABLE IF NOT EXISTS risk_treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
  strategy TEXT NOT NULL CHECK (strategy IN ('Mitigar', 'Transferir', 'Aceptar', 'Evitar')),
  justification TEXT,
  iso_control_id UUID REFERENCES iso_controls(id) ON DELETE SET NULL,
  proposed_control TEXT NOT NULL,
  responsible TEXT NOT NULL,
  implementation_date DATE,
  estimated_cost DECIMAL(12,2),
  priority TEXT DEFAULT 'Media' CHECK (priority IN ('Crítica', 'Alta', 'Media', 'Baja')),
  status TEXT DEFAULT 'Planificado' CHECK (status IN ('Planificado', 'En Progreso', 'Implementado', 'Verificado')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: Riesgo Residual
CREATE TABLE IF NOT EXISTS residual_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
  treatment_id UUID NOT NULL REFERENCES risk_treatments(id) ON DELETE CASCADE,
  -- Valores post-tratamiento
  residual_probability INTEGER NOT NULL CHECK (residual_probability BETWEEN 1 AND 5),
  residual_impact INTEGER NOT NULL CHECK (residual_impact BETWEEN 1 AND 5),
  -- Nivel de riesgo residual calculado
  residual_risk_level DECIMAL(10,2) GENERATED ALWAYS AS (residual_probability * residual_impact) STORED,
  residual_risk_category TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN residual_probability * residual_impact >= 20 THEN 'Crítico'
      WHEN residual_probability * residual_impact >= 15 THEN 'Alto'
      WHEN residual_probability * residual_impact >= 10 THEN 'Medio'
      WHEN residual_probability * residual_impact >= 5 THEN 'Bajo'
      ELSE 'Muy Bajo'
    END
  ) STORED,
  is_acceptable BOOLEAN DEFAULT FALSE,
  evaluation_date DATE DEFAULT CURRENT_DATE,
  evaluated_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: Observaciones y Recomendaciones
CREATE TABLE IF NOT EXISTS observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID REFERENCES risks(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Observación', 'Recomendación', 'Hallazgo', 'Nota')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'Media' CHECK (priority IN ('Alta', 'Media', 'Baja')),
  status TEXT DEFAULT 'Abierta' CHECK (status IN ('Abierta', 'En Revisión', 'Resuelta', 'Cerrada')),
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: Monitoreo y Seguimiento
CREATE TABLE IF NOT EXISTS monitoring_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID REFERENCES risks(id) ON DELETE CASCADE,
  treatment_id UUID REFERENCES risk_treatments(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('Revisión', 'Actualización', 'Verificación', 'Incidente', 'Cambio de Estado')),
  description TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  performed_by TEXT,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  next_review_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: Configuración de Reportes
CREATE TABLE IF NOT EXISTS report_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL CHECK (report_type IN ('Ejecutivo', 'Técnico', 'Cumplimiento', 'Tendencias')),
  filters JSONB,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_risks_asset ON risks(asset_id);
CREATE INDEX IF NOT EXISTS idx_risks_status ON risks(status);
CREATE INDEX IF NOT EXISTS idx_risks_threat ON risks(threat_id);
CREATE INDEX IF NOT EXISTS idx_risks_vulnerability ON risks(vulnerability_id);
CREATE INDEX IF NOT EXISTS idx_treatments_risk ON risk_treatments(risk_id);
CREATE INDEX IF NOT EXISTS idx_treatments_status ON risk_treatments(status);
CREATE INDEX IF NOT EXISTS idx_residual_risk ON residual_risks(risk_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_risk ON monitoring_logs(risk_id);
CREATE INDEX IF NOT EXISTS idx_observations_risk ON observations(risk_id);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Categorías de Activos
INSERT INTO asset_categories (name, description) VALUES
  ('Hardware', 'Equipos físicos de cómputo y comunicaciones'),
  ('Software', 'Aplicaciones, sistemas operativos y plataformas'),
  ('Datos', 'Información y bases de datos'),
  ('Red', 'Infraestructura de red y comunicaciones'),
  ('Personal', 'Recursos humanos con acceso a información'),
  ('Instalaciones', 'Infraestructura física y centros de datos'),
  ('Servicios', 'Servicios de TI y terceros')
ON CONFLICT DO NOTHING;

-- Amenazas comunes
INSERT INTO threats (name, description, category, source) VALUES
  ('Malware', 'Software malicioso incluyendo virus, ransomware, troyanos', 'Técnica', 'Externa'),
  ('Phishing', 'Ataques de ingeniería social por correo electrónico', 'Humana Intencional', 'Externa'),
  ('Acceso no autorizado', 'Intento de acceso a sistemas sin permisos', 'Humana Intencional', 'Externa/Interna'),
  ('Falla de hardware', 'Mal funcionamiento de equipos físicos', 'Técnica', 'Interna'),
  ('Desastre natural', 'Terremotos, inundaciones, incendios naturales', 'Natural', 'Externa'),
  ('Error humano', 'Errores involuntarios de usuarios o administradores', 'Humana No Intencional', 'Interna'),
  ('Denegación de servicio', 'Ataques DDoS que afectan disponibilidad', 'Técnica', 'Externa'),
  ('Fuga de información', 'Divulgación no autorizada de datos sensibles', 'Humana Intencional', 'Interna'),
  ('Falla eléctrica', 'Cortes o fluctuaciones de energía', 'Ambiental', 'Externa'),
  ('Robo de credenciales', 'Obtención ilícita de usuarios y contraseñas', 'Humana Intencional', 'Externa')
ON CONFLICT DO NOTHING;

-- Vulnerabilidades comunes
INSERT INTO vulnerabilities (name, description, category, severity) VALUES
  ('Software desactualizado', 'Sistemas sin parches de seguridad', 'Técnica', 4),
  ('Contraseñas débiles', 'Políticas de contraseñas inadecuadas', 'Humana', 3),
  ('Falta de cifrado', 'Datos transmitidos o almacenados sin cifrar', 'Técnica', 4),
  ('Sin respaldo', 'Ausencia de copias de seguridad', 'Organizacional', 5),
  ('Acceso físico no controlado', 'Falta de controles de acceso físico', 'Física', 3),
  ('Falta de capacitación', 'Personal sin formación en seguridad', 'Humana', 3),
  ('Configuración insegura', 'Configuraciones por defecto o débiles', 'Técnica', 4),
  ('Sin monitoreo', 'Ausencia de logs y alertas de seguridad', 'Organizacional', 4),
  ('Segregación inadecuada', 'Falta de separación de redes y funciones', 'Técnica', 3),
  ('Sin plan de continuidad', 'Ausencia de BCP/DRP', 'Organizacional', 4)
ON CONFLICT DO NOTHING;

-- Controles ISO 27002:2022 (muestra representativa)
INSERT INTO iso_controls (control_id, name, description, category, objective) VALUES
  ('5.1', 'Políticas de seguridad de la información', 'Proporcionar dirección y apoyo de gestión para la seguridad de la información', 'Organizacional', 'Establecer un marco de políticas'),
  ('5.2', 'Roles y responsabilidades de seguridad', 'Definir y asignar roles de seguridad de la información', 'Organizacional', 'Asegurar responsabilidades claras'),
  ('5.15', 'Control de acceso', 'Reglas para controlar el acceso físico y lógico a la información', 'Organizacional', 'Limitar acceso a usuarios autorizados'),
  ('5.24', 'Planificación y preparación de gestión de incidentes', 'Planificar y prepararse para gestionar incidentes de seguridad', 'Organizacional', 'Respuesta efectiva a incidentes'),
  ('6.3', 'Concientización en seguridad', 'Sensibilizar al personal sobre seguridad de la información', 'Personal', 'Cultura de seguridad'),
  ('7.1', 'Perímetro de seguridad física', 'Definir perímetros de seguridad física', 'Física', 'Protección de instalaciones'),
  ('7.4', 'Monitoreo de seguridad física', 'Monitorear continuamente las instalaciones', 'Física', 'Detección de intrusiones'),
  ('8.1', 'Dispositivos de punto final de usuario', 'Proteger información en dispositivos de usuario', 'Tecnológica', 'Seguridad de endpoints'),
  ('8.5', 'Autenticación segura', 'Implementar tecnologías de autenticación segura', 'Tecnológica', 'Verificar identidades'),
  ('8.7', 'Protección contra malware', 'Implementar protección contra software malicioso', 'Tecnológica', 'Prevenir infecciones'),
  ('8.8', 'Gestión de vulnerabilidades técnicas', 'Obtener información sobre vulnerabilidades técnicas', 'Tecnológica', 'Reducir exposición'),
  ('8.12', 'Prevención de fuga de datos', 'Aplicar medidas para prevenir divulgación no autorizada', 'Tecnológica', 'Proteger confidencialidad'),
  ('8.13', 'Respaldo de información', 'Mantener copias de respaldo de información y software', 'Tecnológica', 'Asegurar disponibilidad'),
  ('8.15', 'Registro de actividades', 'Producir, almacenar y analizar logs de actividades', 'Tecnológica', 'Detectar anomalías'),
  ('8.16', 'Actividades de monitoreo', 'Monitorear redes, sistemas y aplicaciones', 'Tecnológica', 'Detección de amenazas'),
  ('8.24', 'Uso de criptografía', 'Definir e implementar reglas para uso de criptografía', 'Tecnológica', 'Proteger información'),
  ('8.28', 'Codificación segura', 'Aplicar principios de codificación segura', 'Tecnológica', 'Reducir vulnerabilidades'),
  ('8.32', 'Gestión de cambios', 'Controlar cambios que afecten la seguridad', 'Tecnológica', 'Mantener seguridad')
ON CONFLICT DO NOTHING;

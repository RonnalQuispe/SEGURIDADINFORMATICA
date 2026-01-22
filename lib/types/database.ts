// Tipos TypeScript para la base de datos de Gestión de Riesgos Cibernéticos

export interface AssetCategory {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Asset {
  id: string
  name: string
  description: string | null
  category_id: string | null
  owner: string
  location: string | null
  confidentiality_value: number
  integrity_value: number
  availability_value: number
  total_value: number
  criticality_level: 'Crítico' | 'Alto' | 'Medio' | 'Bajo'
  status: 'Activo' | 'Inactivo' | 'En revisión'
  created_at: string
  updated_at: string
  // Relaciones
  category?: AssetCategory
}

export interface Threat {
  id: string
  name: string
  description: string | null
  category: 'Natural' | 'Humana Intencional' | 'Humana No Intencional' | 'Técnica' | 'Ambiental'
  source: string | null
  created_at: string
  updated_at: string
}

export interface Vulnerability {
  id: string
  name: string
  description: string | null
  category: 'Técnica' | 'Organizacional' | 'Física' | 'Humana'
  severity: number
  created_at: string
  updated_at: string
}

export interface ISOControl {
  id: string
  control_id: string
  name: string
  description: string | null
  category: 'Organizacional' | 'Personal' | 'Física' | 'Tecnológica'
  objective: string | null
  created_at: string
}

export interface ExistingControl {
  id: string
  name: string
  description: string | null
  iso_control_id: string | null
  effectiveness: number
  implementation_status: 'Implementado' | 'Parcialmente Implementado' | 'Planificado' | 'No Implementado'
  created_at: string
  updated_at: string
  // Relaciones
  iso_control?: ISOControl
}

export interface Risk {
  id: string
  name: string
  description: string | null
  asset_id: string
  threat_id: string
  vulnerability_id: string
  probability: number
  impact: number
  inherent_risk_level: number
  inherent_risk_category: 'Crítico' | 'Alto' | 'Medio' | 'Bajo' | 'Muy Bajo'
  status: 'Identificado' | 'En Tratamiento' | 'Tratado' | 'Aceptado' | 'Cerrado'
  identified_by: string | null
  identified_date: string
  created_at: string
  updated_at: string
  // Relaciones
  asset?: Asset
  threat?: Threat
  vulnerability?: Vulnerability
  existing_controls?: ExistingControl[]
  treatments?: RiskTreatment[]
  residual_risk?: ResidualRisk
}

export interface RiskTreatment {
  id: string
  risk_id: string
  strategy: 'Mitigar' | 'Transferir' | 'Aceptar' | 'Evitar'
  justification: string | null
  iso_control_id: string | null
  proposed_control: string
  responsible: string
  implementation_date: string | null
  estimated_cost: number | null
  priority: 'Crítica' | 'Alta' | 'Media' | 'Baja'
  status: 'Planificado' | 'En Progreso' | 'Implementado' | 'Verificado'
  created_at: string
  updated_at: string
  // Relaciones
  iso_control?: ISOControl
  risk?: Risk
}

export interface ResidualRisk {
  id: string
  risk_id: string
  treatment_id: string
  residual_probability: number
  residual_impact: number
  residual_risk_level: number
  residual_risk_category: 'Crítico' | 'Alto' | 'Medio' | 'Bajo' | 'Muy Bajo'
  is_acceptable: boolean
  evaluation_date: string
  evaluated_by: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Relaciones
  risk?: Risk
  treatment?: RiskTreatment
}

export interface Observation {
  id: string
  risk_id: string | null
  type: 'Observación' | 'Recomendación' | 'Hallazgo' | 'Nota'
  title: string
  description: string
  priority: 'Alta' | 'Media' | 'Baja'
  status: 'Abierta' | 'En Revisión' | 'Resuelta' | 'Cerrada'
  author: string | null
  created_at: string
  updated_at: string
  // Relaciones
  risk?: Risk
}

export interface MonitoringLog {
  id: string
  risk_id: string | null
  treatment_id: string | null
  action_type: 'Revisión' | 'Actualización' | 'Verificación' | 'Incidente' | 'Cambio de Estado'
  description: string
  previous_status: string | null
  new_status: string | null
  performed_by: string | null
  performed_at: string
  next_review_date: string | null
  created_at: string
  // Relaciones
  risk?: Risk
  treatment?: RiskTreatment
}

export interface ReportConfig {
  id: string
  name: string
  description: string | null
  report_type: 'Ejecutivo' | 'Técnico' | 'Cumplimiento' | 'Tendencias'
  filters: Record<string, unknown> | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// Tipos para estadísticas del dashboard
export interface DashboardStats {
  totalAssets: number
  criticalAssets: number
  totalRisks: number
  criticalRisks: number
  highRisks: number
  mediumRisks: number
  lowRisks: number
  pendingTreatments: number
  implementedControls: number
  openObservations: number
}

// Tipos para la matriz de riesgos
export interface RiskMatrixCell {
  probability: number
  impact: number
  count: number
  risks: Risk[]
}

// Tipos para formularios
export interface AssetFormData {
  name: string
  description: string
  category_id: string
  owner: string
  location: string
  confidentiality_value: number
  integrity_value: number
  availability_value: number
  status: 'Activo' | 'Inactivo' | 'En revisión'
}

export interface RiskFormData {
  name: string
  description: string
  asset_id: string
  threat_id: string
  vulnerability_id: string
  probability: number
  impact: number
  identified_by: string
}

export interface TreatmentFormData {
  risk_id: string
  strategy: 'Mitigar' | 'Transferir' | 'Aceptar' | 'Evitar'
  justification: string
  iso_control_id: string
  proposed_control: string
  responsible: string
  implementation_date: string
  estimated_cost: number
  priority: 'Crítica' | 'Alta' | 'Media' | 'Baja'
}

export interface ResidualRiskFormData {
  risk_id: string
  treatment_id: string
  residual_probability: number
  residual_impact: number
  is_acceptable: boolean
  evaluated_by: string
  notes: string
}

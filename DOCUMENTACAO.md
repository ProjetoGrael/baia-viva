# 🌊 BaíaViva — Documentação Técnica Completa

## Monitoramento Ambiental da Baía de Guanabara
### Projeto Grael — Niterói, RJ

**Versão:** 2.1.0  
**Data:** Abril 2026  
**Status:** MVP Completo com Backend, Admin e Landing Page  
**Instituição:** Projeto Grael (projetograel.org.br)

---

## 1. Visão Geral

O BaíaViva é uma plataforma web colaborativa de ciência cidadã para monitoramento ambiental da Baía de Guanabara (RJ). Desenvolvida em parceria com o Projeto Grael, permite que professores, alunos e a comunidade coletem, visualizem, moderem e exportem dados sobre qualidade da água, poluição e condições ambientais.

### 1.1 Objetivos
- Coletar dados científicos padronizados sobre condições ambientais
- Permitir que a comunidade reporte ocorrências (lixo, animais doentes, etc.)
- Gerar visualizações e dashboards com dados em tempo real
- Exportar dados em formatos compatíveis com ArcGIS (GeoJSON, CSV, XLSX)
- Moderar e validar relatos comunitários antes da publicação

### 1.2 Público-Alvo
| Perfil | Permissões |
|--------|-----------|
| **Admin** | Gestão total, moderação, gestão de papéis, exportação XLSX/CSV |
| **Professor** | Coleta científica, visualização, exportação |
| **Aluno (Student)** | Coleta científica, visualização |
| **Comunidade** | Relatos geolocalizados, ver relatos aprovados |
| **Visitante** | Acesso à landing page pública |

### 1.3 Credenciais de Teste
| Email | Senha | Papel |
|-------|-------|-------|
| admin@baiaviva.test | Admin123! | Administrador |

---

## 2. Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 18 + TypeScript 5 + Vite 5 |
| **Estilização** | Tailwind CSS 3 + shadcn/ui |
| **Mapas** | Leaflet + OpenStreetMap |
| **Gráficos** | Recharts |
| **Backend** | Lovable Cloud (Supabase) |
| **Banco de Dados** | PostgreSQL (via Supabase) |
| **Autenticação** | Supabase Auth (email/senha) |
| **Armazenamento** | Supabase Storage (fotos — bucket `community-photos`) |
| **Formulários** | React Hook Form |
| **Estado Servidor** | TanStack React Query |
| **Exportação** | SheetJS (xlsx) para XLSX/CSV + GeoJSON nativo |
| **Deploy** | Lovable (preview) / Vercel (produção) |

### 2.1 Custo
**Totalmente gratuito:**
- Lovable Cloud: $25/mês de saldo gratuito incluído
- OpenStreetMap: tiles gratuitos
- Vercel: plano hobby gratuito
- Sem VPS, sem custos de hospedagem

---

## 3. Arquitetura do Banco de Dados

### 3.1 Enums
```sql
app_role: admin | professor | student | community
report_type: floating_trash | dead_fish | pollution | other
report_status: pending | approved | rejected
weather_condition: sunny | cloudy | rainy | stormy | foggy
```

### 3.2 Tabelas

#### `user_roles`
Armazena o papel de cada usuário. **Separado do perfil por segurança** (previne escalação de privilégios).
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | PK |
| user_id | UUID | FK → auth.users |
| role | app_role | Papel do usuário |

#### `profiles`
Dados adicionais do usuário. Criado automaticamente no cadastro via trigger `handle_new_user`.
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | PK |
| user_id | UUID | FK → auth.users (unique) |
| full_name | TEXT | Nome completo |
| email | TEXT | Email |
| institution | TEXT | Instituição |

#### `collection_points`
Pontos de coleta científica georreferenciados (6 pontos pré-cadastrados).
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | PK |
| name | TEXT | Nome do ponto |
| latitude | DOUBLE PRECISION | Latitude (WGS84) |
| longitude | DOUBLE PRECISION | Longitude (WGS84) |
| description | TEXT | Descrição |
| created_by | UUID | FK → auth.users |

#### `scientific_records`
Registros de campo dos monitoramentos científicos.
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | PK |
| collection_point_id | UUID | FK → collection_points |
| user_id | UUID | FK → auth.users |
| turbidity | DECIMAL(6,2) | Turbidez (NTU) |
| ph | DECIMAL(4,2) | pH da água |
| water_temp | DECIMAL(5,2) | Temperatura (°C) |
| trash_count | INT | Contagem de lixo |
| weather | weather_condition | Condição climática |
| wind_speed | DECIMAL(5,2) | Velocidade do vento (km/h) |
| wind_direction | TEXT | Direção do vento |
| water_appearance | TEXT | Aspecto visual da água |
| latitude | DOUBLE PRECISION | Latitude (WGS84) |
| longitude | DOUBLE PRECISION | Longitude (WGS84) |
| notes | TEXT | Observações |
| recorded_at | TIMESTAMPTZ | Data/hora da coleta |

#### `community_reports`
Relatos da comunidade sobre ocorrências ambientais.
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | PK |
| reporter_id | UUID | FK → auth.users |
| type | report_type | Tipo de ocorrência |
| description | TEXT | Descrição |
| latitude | DOUBLE PRECISION | Latitude (WGS84) |
| longitude | DOUBLE PRECISION | Longitude (WGS84) |
| photo_url | TEXT | URL da foto (Supabase Storage) |
| status | report_status | pending → approved/rejected |
| reporter_name | TEXT | Nome do relator |
| moderated_by | UUID | FK → auth.users (moderador) |
| moderated_at | TIMESTAMPTZ | Data da moderação |

---

## 4. Segurança (RLS)

Todas as tabelas possuem **Row Level Security (RLS) ativado**.

### 4.1 Funções auxiliares (SECURITY DEFINER)
- `has_role(user_id, role)` → verifica se usuário tem determinado papel
- `get_user_role(user_id)` → retorna o papel do usuário
- `handle_new_user()` → trigger que cria perfil + role "community" automaticamente no cadastro
- `update_updated_at_column()` → atualiza timestamp em updates

### 4.2 Políticas por tabela
| Tabela | Operação | Quem pode |
|--------|----------|-----------|
| user_roles | SELECT | Próprio usuário ou admin |
| user_roles | INSERT/UPDATE/DELETE | Apenas admin |
| profiles | SELECT | Próprio usuário ou admin |
| profiles | UPDATE | Próprio usuário |
| collection_points | SELECT | Todos autenticados |
| collection_points | INSERT/UPDATE/DELETE | Apenas admin |
| scientific_records | SELECT/INSERT | Admin, professor, student |
| scientific_records | UPDATE/DELETE | Apenas admin |
| community_reports | SELECT | Aprovados (todos) ou próprios ou admin |
| community_reports | INSERT | Usuário autenticado (como reporter) |
| community_reports | UPDATE/DELETE | Apenas admin |

### 4.3 Storage
- **Bucket:** `community-photos` (privado)
- Upload: usuário autenticado (pasta por user_id)
- Leitura: dono da foto ou admin
- Exclusão: apenas admin

---

## 5. Estrutura de Arquivos

```
src/
├── App.tsx                      # Rotas com proteção por papel
├── contexts/
│   └── AuthContext.tsx           # Contexto de autenticação global
├── components/
│   ├── AppLayout.tsx             # Layout com sidebar, info do usuário, logout
│   ├── BayMap.tsx                # Mapa Leaflet com dados do Supabase
│   ├── ProtectedRoute.tsx        # Proteção de rotas por autenticação/papel
│   ├── StatCard.tsx              # Card de estatística
│   ├── NavLink.tsx               # NavLink compatível com react-router
│   └── ui/                       # Componentes shadcn/ui
├── hooks/
│   ├── useSupabaseData.ts        # Hooks React Query (CRUD todas as tabelas)
│   └── use-mobile.tsx            # Hook de detecção mobile
├── integrations/supabase/
│   ├── client.ts                 # Cliente Supabase configurado
│   └── types.ts                  # Tipos gerados automaticamente
├── pages/
│   ├── LandingPage.tsx           # Landing page pública (Projeto Grael)
│   ├── Auth.tsx                  # Login / Cadastro
│   ├── Dashboard.tsx             # Painel com gráficos e mapa
│   ├── MapPage.tsx               # Mapa em tela cheia
│   ├── ScientificCollection.tsx  # Formulário de coleta científica
│   ├── CommunityReports.tsx      # Relatos comunitários
│   ├── DataExport.tsx            # Tabelas e exportação CSV/GeoJSON
│   └── AdminPanel.tsx            # Painel admin: moderação, usuários, exportação
├── assets/
│   ├── hero-bay.jpg              # Imagem hero da landing page
│   ├── students-monitoring.jpg   # Alunos monitorando
│   └── community-report.jpg     # Comunidade reportando
└── lib/
    ├── mock-data.ts              # Dados mock (mantido como referência)
    └── utils.ts                  # Utilitários (cn)
```

---

## 6. Rotas da Aplicação

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/` | Público | Landing page do Projeto Grael |
| `/auth` | Público | Login e cadastro |
| `/dashboard` | Autenticado | Painel de monitoramento com gráficos |
| `/mapa` | Autenticado | Mapa interativo em tela cheia |
| `/coleta` | Admin/Professor/Aluno | Formulário de coleta científica |
| `/comunidade` | Autenticado | Envio de relatos comunitários |
| `/dados` | Admin/Professor/Aluno | Tabelas e exportação CSV/GeoJSON |
| `/admin` | Admin | Moderação, gestão de usuários, exportação XLSX |

---

## 7. Fluxos Principais

### 7.1 Cadastro e Login
1. Visitante acessa landing page (`/`)
2. Clica em "Participar Agora" → `/auth`
3. Cria conta com email/senha/nome
4. Trigger `handle_new_user` cria perfil + role `community`
5. Admin pode promover via Painel de Administração (`/admin` → Usuários)

### 7.2 Coleta Científica
1. Professor/aluno acessa `/coleta`
2. Seleciona ponto de coleta do banco de dados
3. Captura GPS do navegador ou digita coordenadas
4. Preenche dados (turbidez NTU, pH, temperatura °C, contagem de lixo, clima, vento)
5. Salva → `scientific_records` via Supabase com RLS

### 7.3 Relato Comunitário
1. Qualquer usuário autenticado acessa `/comunidade`
2. Clica no mapa ou usa GPS para selecionar localização
3. Seleciona tipo (lixo flutuante, peixe morto, poluição, outro) e descreve
4. Envia → `community_reports` com status `pending`
5. Admin modera no Painel de Administração (aprova/rejeita)

### 7.4 Moderação (Admin)
1. Admin acessa `/admin` → aba "Moderação"
2. Filtra por status (Pendentes/Aprovados/Rejeitados/Todos)
3. Aprova ✅ ou rejeita ❌ cada relato
4. Relatos aprovados aparecem no mapa e no dashboard

### 7.5 Gestão de Usuários (Admin)
1. Admin acessa `/admin` → aba "Usuários"
2. Visualiza todos os usuários cadastrados
3. Altera papel via dropdown (Comunidade → Professor → Aluno → Admin)

### 7.6 Exportação de Dados
1. Via `/dados`: CSV e GeoJSON (WGS84/EPSG:4326)
2. Via `/admin` → aba "Exportar": **XLSX** e CSV para coletas, relatos e usuários
3. GeoJSON compatível diretamente com ArcGIS, QGIS e Google Earth

---

## 8. Coordenadas e Georreferenciamento

- **Sistema de coordenadas**: WGS84 (EPSG:4326)
- **Formato GeoJSON**: `[longitude, latitude]` (padrão OGC)
- **CRS declarado no GeoJSON**: `urn:ogc:def:crs:EPSG::4326`
- **Compatibilidade**: ArcGIS, QGIS, Google Earth, Mapbox
- **Pontos de coleta pré-cadastrados** (6 pontos na Baía de Guanabara):
  - Praia de Botafogo, Ilha de Paquetá, Praia de Icaraí
  - Ilha do Governador, São Gonçalo, Praia de Jurujuba

---

## 9. Guia de Manutenção

### 9.1 Adicionar novo ponto de coleta
- **Via Admin**: Futuramente pelo painel (a implementar)
- **Via SQL**: `INSERT INTO collection_points (name, latitude, longitude, description) VALUES (...)`
- **Via Lovable Cloud**: Database → `collection_points` → Insert

### 9.2 Promover usuário
- **Via Painel Admin** (`/admin` → Usuários): Selecionar novo papel no dropdown
- **Via SQL**: `UPDATE user_roles SET role = 'professor' WHERE user_id = '<uuid>'`

### 9.3 Adicionar novo tipo de relato
1. Criar migration: `ALTER TYPE report_type ADD VALUE 'novo_tipo'`
2. Atualizar `REPORT_TYPE_LABELS` e `REPORT_TYPE_COLORS` em:
   - `CommunityReports.tsx`
   - `Dashboard.tsx`
   - `DataExport.tsx`
   - `AdminPanel.tsx`
   - `BayMap.tsx`

### 9.4 Adicionar novo campo ao formulário de coleta
1. Criar migration: `ALTER TABLE scientific_records ADD COLUMN novo_campo TIPO`
2. Atualizar `ScientificCollection.tsx` (formulário)
3. Atualizar `useSupabaseData.ts` (hooks)
4. Atualizar `DataExport.tsx` e `AdminPanel.tsx` (tabelas e exportação)
5. Atualizar `Dashboard.tsx` (se agregar dados)

### 9.5 Backup dos dados
```bash
# Via psql (variáveis já configuradas no Lovable Cloud)
psql -c "COPY (SELECT * FROM scientific_records) TO STDOUT WITH CSV HEADER" > backup_coletas.csv
psql -c "COPY (SELECT * FROM community_reports) TO STDOUT WITH CSV HEADER" > backup_relatos.csv
```

---

## 10. Design System

### 10.1 Cores
| Token | HSL | Uso |
|-------|-----|-----|
| `--primary` | 199 89% 36% | Azul oceânico principal |
| `--secondary` | 168 60% 40% | Verde-água |
| `--accent` | 38 92% 55% | Amarelo/âmbar de destaque |
| `--grael-navy` | 207 78% 16% | Azul marinho Projeto Grael |
| `--grael-gold` | 42 92% 56% | Dourado Projeto Grael |
| `--coral` | 16 80% 58% | Coral para alertas |
| `--ocean-deep` | 210 80% 20% | Oceano profundo |

### 10.2 Tipografia
- **Headings**: Plus Jakarta Sans (800, 700, 600)
- **Body**: Inter (400, 500, 600)

### 10.3 Componentes visuais
- `glass-card`: Glassmorphism com blur e borda translúcida
- `gradient-ocean`: Gradiente de oceano profundo
- `shadow-ocean`: Sombra azulada suave

---

## 11. Próximos Passos

- [ ] Upload de fotos nos relatos comunitários (bucket já criado)
- [ ] PWA para funcionamento offline em campo
- [ ] Notificações por email para novos relatos pendentes
- [ ] Integração com API de marés e dados meteorológicos
- [ ] Histórico temporal / série histórica de qualidade por ponto
- [ ] CRUD de pontos de coleta pelo painel admin
- [ ] Relatórios PDF automáticos por período

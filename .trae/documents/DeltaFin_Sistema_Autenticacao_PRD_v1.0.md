# DeltaFin - Sistema de Autenticação via Google
## Documento de Requisitos do Produto (PRD) v1.0

## 1. Product Overview
Sistema de autenticação completo para o DeltaFin utilizando Google OAuth via Supabase, garantindo segurança, facilidade de uso e experiência fluida para gerenciamento de finanças pessoais.

O sistema resolve o problema de acesso seguro aos dados financiais pessoais, permitindo que usuários façam login rapidamente com suas contas Google existentes, eliminando a necessidade de criar e lembrar novas credenciais.

## 2. Core Features

### 2.1 User Roles
| Role | Registration Method | Core Permissions |
|------|---------------------|------------------|
| Usuário Autenticado | Login via Google OAuth | Acesso completo ao app, CRUD de transações, categorias e metas |
| Usuário Não Autenticado | N/A | Apenas acesso à tela de login |

### 2.2 Feature Module
Nosso sistema de autenticação consiste nas seguintes páginas principais:
1. **Tela de Login**: botão Google OAuth, loading states, tratamento de erros
2. **Dashboard Protegido**: acesso apenas para usuários autenticados
3. **Todas as Telas Existentes**: proteção via rota privada

### 2.3 Page Details
| Page Name | Module Name | Feature description |
|-----------|-------------|---------------------|
| Tela de Login | Google OAuth Button | Botão "Entrar com Google" estilizado, loading spinner durante autenticação, mensagens de erro amigáveis |
| Tela de Login | Logo e Branding | Logo DeltaFin, título do app, descrição motivacional sobre controle financeiro |
| Dashboard | User Avatar | Avatar do usuário Google, nome, menu dropdown com logout |
| Dashboard | Session Management | Verificação automática de sessão, redirecionamento se não autenticado |
| Todas as Telas | Route Protection | Middleware de proteção que verifica autenticação antes de renderizar |
| Todas as Telas | Loading States | Spinner durante verificação de autenticação inicial |

## 3. Core Process

**Fluxo Principal do Usuário:**
1. Usuário acessa qualquer URL do app
2. Sistema verifica se há sessão ativa no Supabase
3. Se não autenticado → redireciona para `/login`
4. Na tela de login, clica em "Entrar com Google"
5. Redirecionado para OAuth do Google
6. Após autorização, retorna para callback do Supabase
7. Sistema detecta autenticação e redireciona para dashboard
8. Usuário navega normalmente pelo app
9. Para logout, clica no menu do avatar → "Sair"
10. Sessão é limpa e usuário redirecionado para login

**Fluxo de Persistência:**
- Sessão mantida automaticamente pelo Supabase
- Refresh automático de tokens
- Logout manual limpa todos os dados de sessão

```mermaid
graph TD
    A[Acesso ao App] --> B{Usuário Autenticado?}
    B -->|Não| C[Tela de Login]
    B -->|Sim| D[Dashboard]
    C --> E[Clica "Entrar com Google"]
    E --> F[OAuth Google]
    F --> G[Callback Supabase]
    G --> H{Login Sucesso?}
    H -->|Sim| D
    H -->|Não| I[Erro na Tela Login]
    I --> C
    D --> J[Navegação Normal]
    J --> K[Menu Avatar]
    K --> L[Logout]
    L --> M[Limpar Sessão]
    M --> C
```

## 4. User Interface Design

### 4.1 Design Style
- **Cores Primárias**: Azul (#2563eb) e branco, mantendo consistência com o app
- **Cores Secundárias**: Cinza (#6b7280) para textos secundários, vermelho (#ef4444) para erros
- **Botões**: Estilo Google oficial (branco com borda, ícone Google colorido)
- **Fontes**: Inter ou system fonts, tamanhos 14px-24px
- **Layout**: Centralizado, card-based, responsivo mobile-first
- **Ícones**: Lucide React para consistência, ícone oficial Google para OAuth

### 4.2 Page Design Overview
| Page Name | Module Name | UI Elements |
|-----------|-------------|-------------|
| Tela de Login | Container Principal | Card centralizado, fundo gradiente azul claro, sombra suave |
| Tela de Login | Logo Section | Logo DeltaFin 64px, título "DeltaFin" fonte bold 32px, subtítulo cinza 16px |
| Tela de Login | OAuth Button | Botão branco, borda cinza, ícone Google oficial, texto "Entrar com Google" |
| Tela de Login | Loading State | Spinner azul, texto "Conectando...", botão desabilitado |
| Tela de Login | Error State | Card vermelho claro, ícone alerta, mensagem de erro, botão "Tentar Novamente" |
| Dashboard | User Menu | Avatar circular 40px, nome usuário, dropdown com "Sair" |

### 4.3 Responsiveness
- **Mobile-first**: Design otimizado para smartphones
- **Breakpoints**: sm (640px), md (768px), lg (1024px)
- **Touch-friendly**: Botões mínimo 44px, espaçamento adequado
- **Orientação**: Suporte portrait e landscape
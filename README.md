# DeltaFin 💰

Um aplicativo moderno de gestão financeira pessoal construído com React, TypeScript e Supabase.

## 🚀 Funcionalidades

- **Dashboard Financeiro**: Visão geral completa das suas finanças com gráficos interativos
- **Gestão de Transações**: Controle de receitas e despesas com categorização
- **Categorias Personalizadas**: Crie e gerencie categorias com ícones personalizados
- **Metas Financeiras**: Defina e acompanhe suas metas de economia
- **Autenticação Segura**: Sistema de login/registro com Supabase Auth
- **Exportação de Dados**: Exporte seus dados em CSV ou PDF
- **Tema Escuro/Claro**: Interface adaptável às suas preferências
- **Design Responsivo**: Funciona perfeitamente em desktop e mobile
- **PWA Ready**: Pode ser instalado como aplicativo

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database + Auth + Storage)
- **Charts**: Chart.js / Recharts
- **Icons**: Lucide React
- **Build**: Vite
- **Deploy**: Vercel

## 📦 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/SEU_USUARIO/DeltaFin.git
cd DeltaFin
```

2. **Instale as dependências**
```bash
pnpm install
# ou
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
VITE_APP_NAME=DeltaFin
VITE_APP_VERSION=1.0.0
```

4. **Execute as migrações do banco de dados**
```bash
# Execute os arquivos SQL em supabase/migrations/ no seu projeto Supabase
```

5. **Inicie o servidor de desenvolvimento**
```bash
pnpm dev
# ou
npm run dev
```

## 🗄️ Estrutura do Banco de Dados

O projeto inclui migrações SQL completas para:
- **users**: Perfis de usuário
- **categories**: Categorias de transações
- **transactions**: Registros de receitas/despesas
- **goals**: Metas financeiras
- **RLS**: Políticas de segurança em nível de linha

## 🚀 Deploy

### Vercel (Recomendado)
```bash
pnpm build
vercel --prod
```

### Outras plataformas
```bash
pnpm build
# O build estará na pasta dist/
```

## 🔧 Scripts Disponíveis

```bash
pnpm dev          # Servidor de desenvolvimento
pnpm build        # Build para produção
pnpm preview      # Preview do build
pnpm lint         # Verificação de código
```

## 🔐 Segurança

- ✅ Autenticação segura com Supabase Auth
- ✅ RLS (Row Level Security) habilitado
- ✅ Variáveis de ambiente protegidas
- ✅ Validação de dados no frontend e backend
- ✅ HTTPS obrigatório em produção

## 📱 PWA

O aplicativo pode ser instalado como PWA:
1. Acesse o site no navegador
2. Clique em "Instalar" quando solicitado
3. Use como aplicativo nativo

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:
1. Verifique as [Issues](https://github.com/SEU_USUARIO/DeltaFin/issues) existentes
2. Crie uma nova issue se necessário
3. Consulte a documentação do [Supabase](https://supabase.com/docs)

---

Desenvolvido com ❤️ para ajudar você a ter controle total das suas finanças!

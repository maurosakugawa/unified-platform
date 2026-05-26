# Smart Planner

Sistema moderno de gerenciamento de eventos, tarefas e produtividade desenvolvido com React, TypeScript e Vite.

---

## ✨ Tecnologias

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white)
![DaisyUI](https://img.shields.io/badge/DaisyUI-5A0EF8?style=for-the-badge)
![FramerMotion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge)
![React_Router_DOM](https://img.shields.io/badge/React_Router_DOM-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Lucide_Icons](https://img.shields.io/badge/Lucide_Icons-F56565?style=for-the-badge&logo=lucide&logoColor=white)

---

## 📚 Sumário

- [Smart Planner](#smart-planner)
  - [✨ Tecnologias](#-tecnologias)
  - [📚 Sumário](#-sumário)
  - [🎨 Funcionalidades](#-funcionalidades)
    - [✅ Tema Dark/Light](#-tema-darklight)
    - [✅ Gestão de Eventos](#-gestão-de-eventos)
    - [✅ Interface Moderna](#-interface-moderna)
    - [✅ UX](#-ux)
  - [📁 Estrutura do Projeto](#-estrutura-do-projeto)
  - [🚀 Instalação](#-instalação)
  - [🌙 Sistema de Temas](#-sistema-de-temas)
  - [🎞️ Animações](#️-animações)
  - [📌 Roadmap](#-roadmap)
    - [✅ Sprint 1 — Estrutura do módulo Events](#-sprint-1--estrutura-do-módulo-events)
    - [✅ Sprint 2 — CRUD de Eventos](#-sprint-2--crud-de-eventos)
    - [✅ Sprint 2.1 — Melhorias de UI](#-sprint-21--melhorias-de-ui)
    - [✅ Sprint 2A — Base Visual](#-sprint-2a--base-visual)
    - [✅ Sprint 2B — Página de Eventos](#-sprint-2b--página-de-eventos)
    - [✅ Sprint 2C — Melhorias Avançadas](#-sprint-2c--melhorias-avançadas)
    - [✅ Sprint 2C.1 — Persistência + Busca](#-sprint-2c1--persistência--busca)
    - [✅ Sprint 2C.2 — Modal + Edição](#-sprint-2c2--modal--edição)
    - [✅ Sprint 2C.3 — Filtros + Ordenação](#-sprint-2c3--filtros--ordenação)
    - [✅ Sprint 2C.4 — Sistema de Temas](#-sprint-2c4--sistema-de-temas)
    - [✅ Sprint 2C.5 — Framer Motion + Transições](#-sprint-2c5--framer-motion--transições)
    - [✅ Sprint 2C.6 — Calendário Visual](#-sprint-2c6--calendário-visual)
    - [✅ Sprint 2C.7 — Toasts + Notificações + Reminder System](#-sprint-2c7--toasts--notificações--reminder-system)
    - [✅ Sprint 2C.7.1 - Toast engine](#-sprint-2c71---toast-engine)
    - [✅ Sprint 2C.7.2 - Reminder engine](#-sprint-2c72---reminder-engine)
    - [Próximas Sprints](#próximas-sprints)
  - [👨‍💻 Autor](#-autor)
  - [📄 Licença](#-licença)

---

## 🎨 Funcionalidades

### ✅ Tema Dark/Light

- Persistência com localStorage
- Alternância dinâmica
- UI responsiva

### ✅ Gestão de Eventos

- Criar eventos
- Editar eventos
- Remover eventos
- Filtrar por categoria
- Filtrar por prioridade
- Busca dinâmica

### ✅ Interface Moderna

- Layout dashboard
- Sidebar responsiva
- Header dinâmico
- Glassmorphism
- Animações suaves

### ✅ UX

- Empty states
- Hover animations
- Stagger animations
- Transições com Framer Motion

---

## 📁 Estrutura do Projeto

```bash
src/
├── animations/
├── components/
│   └── ui/
├── contexts/
├── layouts/
├── modules/
│   └── events/
├── routes/
├── store/
├── styles/
└── types/
````

---

## 🚀 Instalação

Clone o projeto:

```bash
git clone <repo>
```

Entre na pasta:

```bash
cd smart-planner
```

Instale as dependências:

```bash
npm install
```

Execute o projeto:

```bash
npm run dev
```

---

## 🌙 Sistema de Temas

O projeto utiliza:

- DaisyUI
- TailwindCSS
- CSS Variables
- data-theme

Temas disponíveis:

- light
- dark

---

## 🎞️ Animações

O projeto utiliza Framer Motion para:

- Fade transitions
- Hover interactions
- Modal animations
- Stagger lists
- Smooth page transitions

---

## 📌 Roadmap

### ✅ Sprint 1 — Estrutura do módulo Events

Criação da arquitetura modular inicial:

```bash
modules/events/
├── components/
├── pages/
├── services/
├── store/
├── types/
└── utils/
```

*Resultado da Sprint*

- [x] Estrutura escalável
- [x] Organização modular
- [x] Separação de responsabilidades
- [x] Base preparada para crescimento
- [x] Padronização do projeto

---

### ✅ Sprint 2 — CRUD de Eventos

Implementação da lógica principal de gerenciamento de eventos.

*Resultado da Sprint*

- [x] Cadastro de eventos
- [x] Edição de eventos
- [x] Exclusão de eventos
- [x] Estado global com Zustand
- [x] Persistência de estado
- [x] Base pronta para calendário visual

---

### ✅ Sprint 2.1 — Melhorias de UI

Evolução visual da aplicação.

*Resultado da Sprint*

- [x] Container centralizado
- [x] Grid responsivo
- [x] Cards reutilizáveis
- [x] Badges de prioridade
- [x] Cores por categoria
- [x] Melhorias de responsividade

---

### ✅ Sprint 2A — Base Visual

Criação da fundação visual da aplicação.

*Componentes criados*

- [x] MainLayout
- [x] Sidebar
- [x] Header
- [x] Card
- [x] Button
- [x] Input

*Resultado da Sprint*

- [x] Layout dashboard
- [x] Sistema de UI reutilizável
- [x] Padronização visual

---

### ✅ Sprint 2B — Página de Eventos

Construção da interface principal de eventos.

*Funcionalidades*

- [x] Grid de eventos
- [x] Formulário de criação
- [x] Listagem dinâmica
- [x] Cards interativos
- [x] Empty states
- [x] Filtros de eventos

---

### ✅ Sprint 2C — Melhorias Avançadas

Evolução da experiência do usuário e da arquitetura da aplicação.

---

### ✅ Sprint 2C.1 — Persistência + Busca

*Objetivos*

Adicionar:

- Persistência real dos dados
- Busca instantânea
- Filtros
- Dashboard funcional
- Experiência estilo SaaS moderno
- Arquitetura escalável

*Resultado da Sprint*

- [x] Persistência com localStorage
- [x] Busca em tempo real
- [x] Filtros dinâmicos
- [x] Melhor organização de estado
- [x] Estrutura preparada para crescimento
- [x] UX moderna

---

### ✅ Sprint 2C.2 — Modal + Edição

*Objetivos*

Adicionar:

- Modal elegante
- Edição de eventos
- Reaproveitamento do formulário
- UX moderna
- Preparação para calendário visual
- Formulário reutilizável

*Resultado da Sprint*

- [x] Modal reutilizável
- [x] Sistema de edição
- [x] Form compartilhado
- [x] Melhor experiência de usuário
- [x] Estrutura preparada para expansão

---

### ✅ Sprint 2C.3 — Filtros + Ordenação

*Objetivos*

Adicionar:

*Filtros*

- Categoria
- Prioridade
- Busca textual

*Ordenação*

- Data
- Prioridade
- Criação
- Ordem alfabética

*Resultado da Sprint*

- [x] Busca textual dinâmica
- [x] Filtro por categoria
- [x] Filtro por prioridade
- [x] Ordenação alfabética
- [x] Ordenação por prioridade
- [x] Ordenação por data
- [x] Ordenação por criação
- [x] Melhor experiência de navegação

---

### ✅ Sprint 2C.4 — Sistema de Temas

*Objetivos*

Adicionar:

- Dark Mode
- Light Mode
- Theme Switcher
- Persistência visual
- UI moderna

*Resultado da Sprint*

- [x] Sistema de temas
- [x] Persistência com localStorage
- [x] DaisyUI Themes
- [x] CSS Variables dinâmicas
- [x] Layout adaptável
- [x] UI consistente

---

### ✅ Sprint 2C.5 — Framer Motion + Transições

*Objetivos*

Adicionar:

- Framer Motion
- Animações suaves
- UX premium
- Microinterações

*Resultado da Sprint*

- [x] Fade transitions
- [x] Slide animations
- [x] Hover interactions
- [x] Motion cards
- [x] Stagger animations
- [x] Modal animations
- [x] Smooth transitions

---

### ✅ Sprint 2C.6 — Calendário Visual

*Objetivos*

Adicionar:

- Estrutura por domínio
- React Big Calendar
- Navegação real
- Base futura pronta

*Resultado da Sprint*

- [x] modules/calendar
- [x] separação futura preparada
- [x] arquitetura escalável
- [x] integração funcionando
- [x] localizer pt-BR
- [x] Modal animations
- [x] mapeamento de eventos
- [x] rota /calendar
- [x] sidebar integrada
- [x] navegação React Router
- [x] drag and drop (futuro)
- [x] reminders
- [x] integração contatos
- [x] integração clima
- [x] Google Calendar sync
- [x] eventos recorrentes

---

### ✅ Sprint 2C.7 — Toasts + Notificações + Reminder System

*Objetivos*

- Toasts modernos
- Sistema global de notificações
- Reminder System

### ✅ Sprint 2C.7.1 - Toast engine

*Objetivos*

- Toast engine
- Zustand
- Framer Motion

*Resultado da Sprint*

- [x] Toast engine
- [x] Zustand notifications
- [x] Framer Motion
- [x] auto-dismiss
- [x] feedback UX moderno
- [x] arquitetura desacoplada
- [x] sistema pronto para reminders automáticos
  
### ✅ Sprint 2C.7.2 - Reminder engine

*Objetivos*

- Reminder engine
- Notifications
- UX estilo Google Calendar

*Resultado da Sprint*

- [x] push notifications
- [x] service workers
- [x] eventos temporizados
- [x] notificações desktop
- [x] PWA
- [x] integração mobile

### Próximas Sprints

- [ ] Dashboard analytics
- [ ] Integração clima
- [ ] Agenda de contatos
- [ ] Notificações
- [ ] Persistência backend
- [ ] Autenticação

---

## 👨‍💻 Autor

Mauro Sakugawa

---

## 📄 Licença

MIT License

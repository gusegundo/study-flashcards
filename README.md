# 🃏 Flashcards App

Uma aplicação **totalmente customizável** para criação e estudo de flashcards. O sistema foi desenhado para que você possa cadastrar **qualquer tipo de conteúdo e assunto** à sua escolha, adaptando-se perfeitamente à sua rotina de estudos.

---

## ● Objetivo

Oferecer uma ferramenta flexível onde você define seus próprios baralhos e temas, utilizando conceitos de memorização ativa para otimizar o aprendizado de qualquer matéria.

---

## ● Tecnologias Utilizadas

* **[Python](https://www.python.org/)** — Lógica principal da aplicação e regras de negócio.
* **[SQLite](https://www.sqlite.org/)** — Banco de dados relacional leve para persistência e armazenamento dos cards.

---

## ● Status do Projeto & Funcionalidades

O projeto está em desenvolvimento ativo. A estrutura de back-end e banco de dados já está operacional.

### ● Funcionalidades Atuais (Back-end / Terminal)
- [x] Criação e cadastro de flashcards personalizados para qualquer tema de sua escolha.
- [x] Armazenamento seguro e persistente de dados em banco SQLite.
- [x] Modo estudo: cards em ordem aleatória, com a resposta revelada ao apertar Enter.
- [x] Edição de flashcards (pergunta, resposta ou ambos).
- [x] Exclusão de um flashcard específico ou de todos de uma vez.

### ● Próximos Passos (Roadmap)
- [ ] Modo estudo com verificação de respostas (comparar o que você digitou com a resposta do card).
- [ ] Desenvolvimento de uma interface web interativa com **HTML5**, **CSS3** e **JavaScript**.
- [ ] Criação de categorias/pastas para organizar os baralhos.
- [ ] Integração do front-end com o banco de dados (via API em Python).
- [ ] Sistema de estatísticas de desempenho para acompanhar os estudos.

---

## ● Como Executar o Projeto Localmente

### Pré-requisitos
* **Python 3** instalado.

### Passo a passo
1. Clone este repositório:
   ```bash
   git clone https://github.com/gusegundo/study-flashcards.git
   ```
2. Entre na pasta do aplicativo:
   ```bash
   cd study-flashcards/flashcards
   ```
3. Execute o programa:
   ```bash
   python flashcards.py
   ```
   (em alguns sistemas o comando é `python3 flashcards.py`)

O banco de dados (`flashcards.db`) é criado automaticamente na primeira execução, ao lado do arquivo `flashcards.py`.

---

## ● Estrutura do Projeto

```
study-flashcards/
├── README.md
└── flashcards/
    └── flashcards.py   # aplicação (menu, criar, estudar, editar, excluir)
```

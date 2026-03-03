---
name: "Prática 01"
about: "Template para criar a issue da pratica01"
title: "[Prática 01] – Estrutura Básica de um Programa em ReactJS"
labels: ["pratica01", "react"]
---

## 🎯 Objetivo
Nesta prática, você irá:
- Criar o seu primeiro projeto ReactJS utilizando a ferramenta de *scaffolding* Vite;
- Compreender a estrutura básica de pastas e arquivos de um projeto React;
- Iniciar o servidor de desenvolvimento local e visualizar a aplicação no navegador;
- Realizar sua primeira modificação em um componente (`App.jsx`).

## 📝 Instruções da Atividade

**1️⃣ Preparação do ambiente**
1. Abra o **Visual Studio Code** na pasta raiz do seu repositório.
2. Abra um terminal e certifique-se de que está na branch `develop`:
```bash
git checkout develop
```
3. Crie e alterne para a branch dedicada a esta prática:

```bash
git checkout -b feature/pratica01
```
2️⃣ Criação do Projeto React
1. No terminal do VSCode, acesse a pasta praticas:
```bash
cd praticas
```
2. Crie o projeto React utilizando o Vite (nomeie a pasta como `pratica01`):
```bash
npm create vite@latest pratica01 -- --template react
```
3️⃣ Instalação e Execução
1.  Acesse a pasta do projeto recém-criado:
```bash
cd pratica01
```
2. Instale as dependências necessárias do Node.js:
```bash
npm install
```
3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
4. Pressione `Ctrl + Clique` no link fornecido no terminal (geralmente `http://localhost:5173/`) para abrir a aplicação no navegador.
5. Volte ao VSCode, acesse o arquivo `src/App.jsx` e altere o texto principal para "Olá, Mundo! Este é meu primeiro projeto React.". Salve e veja a mudança imediata no navegador.

📤 Entrega da Prática
1. No terminal do VSCode, pare o servidor pressionando Ctrl + C.
2. Volte para a pasta raiz do repositório:
```bash
cd ../..
```
3. Adicione os arquivos criados ao controle de versão (o Vite já configura o `.gitignore` para ignorar a pesada pasta `node_modules` automaticamente):
```bash
git add .
```
4. Grave suas alterações com um `commit` semântico:
```bash
git commit -m "Feat: Cria estrutura básica do projeto React na Prática 01"
```
5. Envie suas alterações para o GitHub:
```bash
git push origin feature/pratica01
```
6. No GitHub, clique no botão **Compare & pull request.**
7. **Importante:** Certifique-se de que o **base repository** é o seu repositório e a **base branch **é a `develop`.
8. Na descrição, escreva: `Nesta prática, implementei a estrutura básica de um programa em ReactJS. Fecha #ID `(substitua ID pelo número desta Issue).
9. Clique em **Create pull request** e envie o link do PR na plataforma de ensino para o professor.

📂 Estrutura Final Esperada
- Seu repositório deverá apresentar a seguinte organização dentro da pasta da prática:
```plan

praticas/
└── pratica01/
    ├── public/
    ├── src/
    │   ├── App.css
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── vite.config.js
```
### O que mudou e por quê?
* **Criação com Vite (`npm create vite@latest`)**: Inseri a criação do boilerplate automaticamente. Isso evita que o aluno precise criar arquivos como `package.json` ou configurar o Webpack manualmente na primeira aula.
* **Instalação e Servidor (`npm install` e `npm run dev`)**: Substituí os comandos de compilação antigos pelas chamadas reais de execução de um projeto Node/React.
* **Ajuste de Diretórios (`cd ../..`)**: Como o aluno precisa entrar na pasta `praticas/pratica01` para rodar o projeto, adicionei o comando para ele voltar à raiz do repositório antes de rodar o `git add .`, garantindo que o commit seja feito no nível correto do repositório Git.
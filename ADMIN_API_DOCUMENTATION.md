# Documentação da API de Administração da Plataforma Utask

Esta documentação descreve os endpoints da API disponíveis para a área de administração da plataforma Utask.

## Autenticação e Autorização

Todas as rotas de API de administração são prefixadas com `/api/admin/`.
O acesso a esses endpoints requer autenticação e que o usuário possua a role `ADMIN`.
A autenticação é gerenciada via `next-auth` e um token JWT. A role do usuário é verificada no middleware e em cada handler de rota.

Respostas de erro comuns para problemas de autenticação/autorização:
- `401 Unauthorized`: Token não fornecido ou inválido (geralmente tratado pelo middleware `withAuth` antes de chegar ao handler).
- `403 Forbidden`: Token válido, mas o usuário não tem a role `ADMIN` ou permissão para a ação específica.

## 1. Dashboard Principal

### GET `/api/admin/dashboard`
Retorna métricas agregadas para a visão geral do dashboard de administração.
- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "totalUsers": 150,
    "totalServices": 75,
    "servicesByStatus": {
      "OPEN": 20,
      "IN_PROGRESS": 10,
      "COMPLETED": 40,
      "DISPUTED": 5
    },
    "disputes": {
      "open": 5
    },
    "adminWalletBalance": 1234.50,
    "adminWalletReservedBalance": 0
  }
  ```

## 2. Gerenciamento de Profissões

### GET `/api/admin/professions`
Lista todas as profissões cadastradas.
- **Resposta de Sucesso (200 OK):**
  ```json
  [
    { "id": "uuid1", "name": "Eletricista", "icon": "bolt", "createdAt": "...", "updatedAt": "..." },
    { "id": "uuid2", "name": "Encanador", "icon": "wrench", "createdAt": "...", "updatedAt": "..." }
  ]
  ```

### POST `/api/admin/professions`
Cria uma nova profissão.
- **Corpo da Requisição (JSON):**
  ```json
  {
    "name": "Nova Profissão",
    "icon": "optional-icon-string"
  }
  ```
- **Resposta de Sucesso (201 Created):** Retorna o objeto da profissão criada.
- **Respostas de Erro:**
    - `400 Bad Request`: Nome não fornecido.
    - `409 Conflict`: Profissão com o mesmo nome já existe.

### PUT `/api/admin/professions/:id`
Atualiza uma profissão existente.
- **Parâmetros de Rota:** `id` (ID da profissão)
- **Corpo da Requisição (JSON):**
  ```json
  {
    "name": "Nome Atualizado da Profissão",
    "icon": "novo-icon"
  }
  ```
- **Resposta de Sucesso (200 OK):** Retorna o objeto da profissão atualizada.
- **Respostas de Erro:**
    - `400 Bad Request`: Nome não fornecido ou ID inválido.
    - `404 Not Found`: Profissão não encontrada.
    - `409 Conflict`: Outra profissão com o mesmo nome já existe.

### DELETE `/api/admin/professions/:id`
Deleta uma profissão.
- **Parâmetros de Rota:** `id` (ID da profissão)
- **Resposta de Sucesso (200 OK):** `{ "message": "Profissão deletada com sucesso" }`
- **Respostas de Erro:**
    - `400 Bad Request`: ID inválido, ou a profissão possui serviços/usuários associados.
    - `404 Not Found`: Profissão não encontrada.

## 3. Gerenciamento de Usuários

### GET `/api/admin/users`
Lista usuários com paginação, filtros e busca.
- **Query Parameters:**
    - `page` (number, opcional, default: 1)
    - `limit` (number, opcional, default: 10)
    - `search` (string, opcional): Busca por nome, email, CPF.
    - `status` (string, opcional, "all" | "active" | "blocked", default: "all")
    - `sortBy` (string, opcional, default: "createdAt"): Campo para ordenação.
    - `sortOrder` (string, opcional, "asc" | "desc", default: "desc")
- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "users": [ /* array de objetos de usuário (sem senha) */ ],
    "totalPages": 5,
    "currentPage": 1,
    "totalUsers": 48
  }
  ```

### PUT `/api/admin/users/:id/block`
Bloqueia um usuário.
- **Parâmetros de Rota:** `id` (ID do usuário)
- **Resposta de Sucesso (200 OK):** Retorna o objeto do usuário atualizado (parcial).
- **Respostas de Erro:**
    - `400 Bad Request`: Tentativa de bloquear a si mesmo.
    - `403 Forbidden`: Tentativa de bloquear outro admin.
    - `404 Not Found`: Usuário não encontrado.

### PUT `/api/admin/users/:id/unblock`
Desbloqueia um usuário.
- **Parâmetros de Rota:** `id` (ID do usuário)
- **Resposta de Sucesso (200 OK):** Retorna o objeto do usuário atualizado (parcial).
- **Respostas de Erro:**
    - `404 Not Found`: Usuário não encontrado.

### POST `/api/admin/users/:id/notify`
Envia uma notificação personalizada para um usuário.
- **Parâmetros de Rota:** `id` (ID do usuário destinatário)
- **Corpo da Requisição (JSON):**
  ```json
  {
    "title": "Título da Notificação",
    "message": "Conteúdo da mensagem para o usuário."
  }
  ```
- **Resposta de Sucesso (201 Created):** Retorna o objeto da notificação criada.
- **Respostas de Erro:**
    - `400 Bad Request`: Título ou mensagem não fornecidos.
    - `404 Not Found`: Usuário destinatário não encontrado.

### DELETE `/api/admin/users/:id`
Deleta um usuário. (Hard delete)
- **Parâmetros de Rota:** `id` (ID do usuário)
- **Resposta de Sucesso (200 OK):** `{ "message": "Usuário deletado com sucesso" }`
- **Respostas de Erro:**
    - `400 Bad Request`: Tentativa de deletar a si mesmo.
    - `403 Forbidden`: Tentativa de deletar outro admin.
    - `404 Not Found`: Usuário não encontrado.
    - `409 Conflict`: Usuário não pode ser deletado devido a restrições de chave estrangeira (ex: ainda possui dados críticos associados que não são deletados em cascata de forma segura).

## 4. Carteira do Administrador

### GET `/api/admin/wallet`
Visualiza o saldo e histórico de transações da carteira da plataforma/administrador.
- **Query Parameters (para transações):**
    - `page` (number, opcional, default: 1)
    - `limit` (number, opcional, default: 20)
- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "walletInfo": {
      "id": "wallet_admin_uuid",
      "balance": 1234.50,
      "reservedBalance": 0,
      "lastUpdated": "..."
    },
    "transactions": [ /* array de objetos de transação */ ],
    "totalPages": 3,
    "currentPage": 1,
    "totalTransactions": 55
  }
  ```

### POST `/api/admin/wallet/withdraw`
Registra uma solicitação de saque da carteira do administrador. (Implementação simplificada)
- **Corpo da Requisição (JSON):**
  ```json
  {
    "amount": 100.00,
    "description": "Saque para despesas operacionais"
  }
  ```
- **Resposta de Sucesso (201 Created):**
  ```json
  {
    "message": "Solicitação de saque registrada com sucesso. O processamento é manual/externo.",
    "transaction": { /* objeto da transação de SAQUE criada, status PENDING */ },
    "updatedWalletBalance": 1134.50
  }
  ```
- **Respostas de Erro:**
    - `400 Bad Request`: Valor inválido ou saldo insuficiente.
    - `404 Not Found`: Carteira da plataforma não encontrada.

## 5. Gerenciamento de Disputas

### GET `/api/admin/disputes`
Lista serviços em disputa ou resolvidos.
- **Query Parameters:**
    - `page` (number, opcional, default: 1)
    - `limit` (number, opcional, default: 10)
    - `status` (string, opcional, "DISPUTED" | "RESOLVED" | "ALL_DISPUTES", default: "DISPUTED")
- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "disputes": [ /* array de objetos de serviço em disputa/resolvido, com detalhes do criador, provedor, resolução */ ],
    "totalPages": 1,
    "currentPage": 1,
    "totalDisputes": 5
  }
  ```

### POST `/api/admin/disputes/:serviceId/resolve`
Resolve uma disputa para um serviço específico.
- **Parâmetros de Rota:** `serviceId` (ID do serviço em disputa)
- **Corpo da Requisição (JSON):**
  ```json
  {
    "decision": "RELEASE_TO_PROVIDER" | "REFUND_TO_CLIENT" | "PARTIAL_PAYMENT" | "NO_ACTION",
    "justification": "O prestador completou o serviço conforme acordado.",
    "amountReleasedToProvider": 100.00, // Obrigatório para RELEASE_TO_PROVIDER e PARTIAL_PAYMENT (se aplicável)
    "amountRefundedToClient": 0.00     // Obrigatório para REFUND_TO_CLIENT e PARTIAL_PAYMENT (se aplicável)
  }
  ```
- **Resposta de Sucesso (201 Created):** Retorna o objeto `DisputeResolution` criado.
- **Respostas de Erro:**
    - `400 Bad Request`: Dados da requisição inválidos, ou serviço não está em disputa.
    - `404 Not Found`: Serviço não encontrado.
    - `409 Conflict`: Já existe uma resolução para esta disputa.

## 6. Logs de Auditoria

### GET `/api/admin/audit-logs`
Lista os logs de auditoria administrativa com filtros e paginação.
- **Query Parameters:**
    - `page` (number, opcional, default: 1)
    - `limit` (number, opcional, default: 20)
    - `adminId` (string, opcional): Filtra por ID do administrador.
    - `action` (string, opcional): Filtra por tipo de ação (parcial, case-insensitive).
    - `targetEntityType` (string, opcional): Filtra por tipo de entidade.
    - `targetEntityId` (string, opcional): Filtra por ID da entidade.
    - `startDate` (string ISO Date, opcional): Data de início do período.
    - `endDate` (string ISO Date, opcional): Data de fim do período.
    - `sortBy` (string, opcional, default: "timestamp")
    - `sortOrder` (string, opcional, "asc" | "desc", default: "desc")
- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "logs": [ /* array de objetos AdminAuditLog, com dados do admin aninhados */ ],
    "totalPages": 10,
    "currentPage": 1,
    "totalLogs": 198
  }
  ```
---

Esta documentação deve ser mantida atualizada conforme novas funcionalidades são adicionadas ou modificadas.
Considerar o uso de ferramentas como Swagger/OpenAPI para uma documentação mais robusta e interativa no futuro.
```

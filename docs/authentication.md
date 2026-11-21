# Cadastro, login e sessão

Os contratos de autenticação estão no README e em `docs/auth.md` do TripShare Backend. O OpenAPI atual documenta as operações de viagens. O frontend não altera os endpoints nem envia senhas ao backend.

## Cadastro

1. O formulário valida campos obrigatórios, confirmação de senha e limites de username (50), nome (120) e e-mail (254). A política de senha é consultada pelo SDK Firebase antes de criar a conta.
2. O Firebase cria a identidade e fornece UID e ID token. E-mail existente é tratado como erro com orientação para entrar, sem login implícito.
3. `POST /auth/register` recebe Bearer e o frontend envia `{ uuid, username, name }` no corpo. O backend obtém o e-mail do token.
4. Apenas após o perfil ser confirmado, o frontend publica a sessão e navega para Minhas Viagens. Até esse momento, nenhuma tela privada ou serviço autenticado pode usar a identidade provisória.

## Compensação e recuperação

Firebase e PostgreSQL não compartilham uma transação. A coordenação é sequencial, com compensação da criação Firebase quando há rejeição confirmada.

| Resultado | Comportamento |
| --- | --- |
| Firebase rejeita a criação | Não chamar o cadastro no backend. |
| Falha ao obter token antes do envio | Desfazer a identidade criada nessa tentativa. |
| Backend responde 400, 401 ou 403 | Excluir somente a identidade recém-criada, se não houver envio anterior com resultado incerto. |
| Backend responde 409 | Consultar `/auth/login`: perfil confirmado conclui a sessão; 404 confirma conflito e permite compensar a nova identidade. |
| Rede, timeout ou 5xx | Manter pendente, bloquear acesso privado e consultar o perfil antes de reenviar. Um 404 não comprova que um envio anterior já terminou. |
| Exclusão compensatória falha | Exibir erro e permitir retomar a exclusão. Nunca anunciar reversão concluída. |
| Conta já existia antes dessa tentativa | Permitir completar o perfil, sem excluir a identidade em caso de rejeição. |

As chamadas de cadastro e consulta inicial do perfil têm limite de 15 segundos. Uma resposta perdida pode corresponder a uma transação já confirmada. Nesse caso, consultar o perfil recupera o sucesso sem repetir a criação da identidade.

O marcador `tripshare.registration.<uid>` guarda somente UID e etapa (`created`, `uncertain`, `rollback`). Não guarda senha, token ou campos de perfil. Se o armazenamento local estiver indisponível, a recuperação fica limitada à memória da página. Fechar a aba ou perder a conexão impede garantir compensação imediata.

## Login e sessão

O login por senha ou Google obtém a identidade no Firebase e chama `POST /auth/login` com `{ uuid }` e Bearer. `200` confirma a sessão, `404` direciona à conclusão do perfil e suspensão ou indisponibilidade bloqueiam o acesso.

`resources/auth/flow.ts` coordena as operações. `resources/auth/session.ts` mantém os estados `restoring`, `disconnected`, `authenticating`, `pending`, `authenticated` e `error`. Somente `authenticated` publica UID, ID token e perfil utilizáveis pelos serviços privados. O UID Firebase é distinto de `profile.id`, o UUID interno usado nas rotas de perfil.

O SDK usa `browserLocalPersistence` para manter o login até o logout. Após reabrir a aplicação, a identidade restaurada é novamente confirmada no backend. `onIdTokenChanged` e `getIdToken()` atualizam o token em memória; o aplicativo não mantém uma cópia manual em localStorage.

Logout e troca de conta invalidam operações anteriores e limpam o cache privado. Respostas atrasadas não podem confirmar a sessão antiga. O modo de demonstração continua liberando as telas de viagens e lugares com dados fictícios.

## Verificação

Executar em `web`: `npm run lint`, `npm run typecheck`, `npm run test` e `npm run build`. Os testes de serviço cobrem contratos, compensação, recuperação, renovação, concorrência e identidade. Os testes de fluxo combinam router, formulários, provedor de sessão e serviços.

Na integração isolada, usar Firebase Auth Emulator com backend e PostgreSQL próprios. A versão local do emulador não implementa `/v2/passwordPolicy`; somente essa resposta precisa ser simulada no teste. A aplicação mantém a consulta real à política, e as operações de criação, autenticação, exclusão e persistência continuam reais no ambiente de teste.

## Aceite dos documentos legais

O cadastro por e-mail e a conclusão do perfil da conta conectada exigem um aceite explícito dos Termos de Uso e da Política de Privacidade. Os links abrem em outra aba, preservando os dados do formulário. Configure `VITE_TERMS_OF_USE_URL` e `VITE_PRIVACY_POLICY_URL` com os documentos oficiais; sem ambos, o cadastro fica bloqueado.

Esta validação é do frontend. O contrato atual de cadastro não recebe data ou versão do aceite; o registro persistente exigido pelo RF depende de implementação no backend e não é realizado pelo checkbox.

## Nome de usuário em uso

Conflitos de cadastro (`409`) aparecem associados ao campo Nome de usuário. O backend atual não distingue conflitos de username, e-mail e UID; por isso a mensagem informa a possibilidade de nome de usuário ou e-mail já cadastrado. Corrigir o nome ou e-mail limpa o aviso e permite nova tentativa.

Não há consulta prévia de disponibilidade. No cadastro por senha, o Firebase cria uma identidade provisória antes da requisição ao backend. Se o cadastro for rejeitado e a consulta confirmar ausência de perfil, o fluxo existente exclui essa identidade recém-criada. Identidades preexistentes (por exemplo, Google) são preservadas, sem criar perfil ou liberar acesso privado. Falhas de rede ou de exclusão mantêm o estado de recuperação em vez de afirmar que a conta foi removida.

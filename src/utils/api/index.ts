import { UserAccount, User, Transaction, Card } from '../../types';

const baseUrl = 'http://localhost:8080/api';

const myRequest = (method = 'GET', token?: string, body?: any): RequestInit => ({
  method,
  headers: {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  },
  mode: 'cors',
  cache: 'default',
  body: body ? JSON.stringify(body) : undefined,
});

const rejectPromise = (response?: Response): Promise<Response> =>
  Promise.reject({
    status: (response && response.status) || '00',
    statusText: (response && response.statusText) || 'Ocurrió un error',
    err: true,
  });



export const getUserByEmail = (email: string, token: string): Promise<User> => {
  return fetch(`${baseUrl}/users/email/${email}`, myRequest('GET', token))
    .then((res) => res.ok ? res.json() : rejectPromise(res))
    .catch((err) => rejectPromise(err));
};

// === AUTH ===
export const login = (email: string, password: string) => {
  return fetch(`${baseUrl}/auth/login`, myRequest('POST', undefined, { email, password }))
    .then((res) => res.ok ? res.json() : rejectPromise(res))
    .catch((err) => rejectPromise(err));
};

export const createAnUser = (user: User) => {
  return fetch(`${baseUrl}/auth/register`, myRequest('POST', undefined, user))
    .then((res) => res.ok ? res.json() : rejectPromise(res))
    .catch((err) => rejectPromise(err));
};

export const getUser = (id: string, token: string): Promise<User> => {
  return fetch(`${baseUrl}/users/email/${id}`, myRequest('GET', token))
    .then((res) => res.ok ? res.json() : rejectPromise(res))
    .catch((err) => rejectPromise(err));
};


export const updateUser = (id: string, data: any, token: string): Promise<Response> => {
  return fetch(`${baseUrl}/users/id/${id}`, myRequest('PATCH', token, data))
    .then((res) => res.ok ? res.json() : rejectPromise(res))
    .catch((err) => rejectPromise(err));
};

// === ACCOUNTS ===
export const getAccount = (id: string, token: string): Promise<UserAccount> => {
  return fetch(`${baseUrl}/accounts/${id}`, myRequest('GET', token))
    .then((res) => res.ok ? res.json() : rejectPromise(res))
    .catch((err) => rejectPromise(err));
};

export const getAccounts = (): Promise<UserAccount[]> => {
  return fetch(`${baseUrl}/accounts`, myRequest('GET'))
    .then((res) => res.ok ? res.json() : rejectPromise(res))
    .catch((err) => rejectPromise(err));
};

export const updateAccount = (id: string, data: any, token: string): Promise<Response> => {
  return fetch(`${baseUrl}/accounts/${id}`, myRequest('PATCH', token, data))
    .then((res) => res.ok ? res.json() : rejectPromise(res))
    .catch((err) => rejectPromise(err));
};

// === CARDS ===
export const getUserCards = (id: string, token: string): Promise<Card[]> => {
  return fetch(`${baseUrl}/accounts/${id}/cards`, myRequest('GET', token))
    .then((res) => res.ok ? res.json() : rejectPromise(res))
    .catch((err) => rejectPromise(err));
};

export const getUserCard = (userId: string, cardId: string): Promise<Card> => {
  return fetch(`${baseUrl}/accounts/${userId}/cards/${cardId}`, myRequest('GET'))
    .then((res) => res.ok ? res.json() : rejectPromise(res))
    .catch((err) => rejectPromise(err));
};

export const deleteUserCard = (userId: string, cardId: string, token: string): Promise<Response> => {
  return fetch(`${baseUrl}/accounts/${userId}/cards/${cardId}`, myRequest('DELETE', token))
    .then((res) => res.ok ? res.json() : rejectPromise(res))
    .catch((err) => rejectPromise(err));
};

export const createUserCard = (userId: string, card: any, token: string): Promise<Response> => {
  return fetch(`${baseUrl}/accounts/${userId}/cards`, myRequest('POST', token, card))
    .then((res) => res.ok ? res.json() : rejectPromise(res))
    .catch((err) => rejectPromise(err));
};

// === TRANSACTIONS ===
export const getUserActivities = (accountId: string, token: string, limit?: number): Promise<Transaction[]> => {
  return fetch(`${baseUrl}/transactions/account/${accountId}/last`, myRequest('GET', token))
    .then((res) => res.ok ? res.json() : rejectPromise(res))
    .catch((err) => rejectPromise(err));
};

export const getUserActivity = (accountId: string, activityId: string, token: string): Promise<Transaction> => {
  return fetch(`${baseUrl}/transactions/${activityId}`, myRequest('GET', token))
    .then((res) => res.ok ? res.json() : rejectPromise(res))
    .catch((err) => rejectPromise(err));
};

export const createDepositActivity = (
  accountId: number,
  payload: { accountId: number; cardNumber: string; amount: number },
  token: string
): Promise<Transaction> => {
  return fetch(`${baseUrl}/transactions/accounts/${accountId}/transferences`, myRequest('POST', token, payload))
    .then((res) => res.ok ? res.json() : rejectPromise(res))
    .catch((err) => rejectPromise(err));
};


// -------------------------

// TODO: remove when backend is ready
const depositMoney = (amount: number, userId: string, token: string) => {
  return getAccount(userId, token)
    .then((account) => {
      const newBalance = account.balance + amount;
      const accountId = account.id;
      return {
        newBalance,
        accountId,
      };
    })
    .then(({ newBalance, accountId }) => {
      fetch(
        `${baseUrl}/accounts/${accountId}`,
        myRequest('PATCH', token, { balance: newBalance })
      )
        .then((response) =>
          response.ok ? response.json() : rejectPromise(response)
        )
        .catch((err) => {
          console.log(err);
          return rejectPromise(err);
        });
    });
};

// TODO: edit when backend is ready
export const createTransferActivity = (
  userId: string,
  token: string,
  origin: string,
  destination: string,
  amount: number,
  name?: string
) => {
  const payload = {
    type: 'Transfer',
    amount: amount * -1,
    origin,
    destination,
    name,
    dated: new Date(),
  };

  return fetch(`${baseUrl}/transactions/transfer`, myRequest('POST', token, payload))
    .then((res) => res.ok ? res.json() : rejectPromise(res))
    .then((res) => {
      discountMoney(res.amount, userId, token);
      return res;
    })
    .catch((err) => {
      console.log(err);
      return rejectPromise(err);
    });
};
// TODO: remove when backend is ready
const discountMoney = (amount: number, userId: string, token: string) => {
  return getAccount(userId, token)
    .then((account) => {
      const newBalance = account.balance + amount;
      const accountId = account.id;
      return {
        newBalance,
        accountId,
      };
    })
    .then(({ newBalance, accountId }) => {
      fetch(
        `${baseUrl}/accounts/${accountId}`,
        myRequest('PATCH', token, { balance: newBalance })
      )
        .then((response) =>
          response.ok ? response.json() : rejectPromise(response)
        )
        .catch((err) => {
          console.log(err);
          return rejectPromise(err);
        });
    });
};
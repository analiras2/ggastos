// How an item of the month can be removed, and what the confirmation tells the user.
// DELETE and CANCEL are for planned entries; REMOVE_IMPORTED is for an item of a statement.
export type ItemRemoval = 'DELETE' | 'CANCEL' | 'REMOVE_IMPORTED';

type RemovalCopy = { title: string; message: string; confirmLabel: string };

export const REMOVAL_COPY: Record<ItemRemoval, RemovalCopy> = {
  DELETE: {
    title: 'Excluir lançamento?',
    message: 'Esta ação não pode ser desfeita.',
    confirmLabel: 'Excluir',
  },
  CANCEL: {
    title: 'Excluir lançamento?',
    message: 'A recorrência deixa de gerar este lançamento neste mês.',
    confirmLabel: 'Excluir',
  },
  REMOVE_IMPORTED: {
    title: 'Remover item da fatura?',
    message: 'O item deixa de aparecer no app e não volta se você importar esta fatura de novo.',
    confirmLabel: 'Remover',
  },
};

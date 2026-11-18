// What the "apply to all similar items" option tells the user. The count includes the item itself.
export function applyToSimilarDescription(count: number | undefined): string {
  if (count === undefined) {
    return 'Muda a categoria dos itens iguais e vale nas próximas faturas.';
  }

  const others = Math.max(count - 1, 0);
  if (others === 0) {
    return 'Não há outro item igual por enquanto. A categoria vale nas próximas faturas.';
  }

  const noun = others === 1 ? 'outro item igual' : 'outros itens iguais';
  return `Muda a categoria deste item e de ${others} ${noun}. Vale também nas próximas faturas.`;
}

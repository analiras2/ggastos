// Short money tips shown under the greeting. One is picked each time the app opens.
export const FINANCE_QUOTES: readonly string[] = [
  'Quem controla o dinheiro hoje ganha liberdade amanhã.',
  'Antes de comprar, espere 24 horas. O desejo costuma passar.',
  'Pague-se primeiro: separe sua reserva assim que o dinheiro entrar.',
  'Pequenos gastos repetidos pesam mais que uma compra grande.',
  'Planejar não tira a diversão, evita o susto no fim do mês.',
  'O que não é medido não é melhorado. Anote seus gastos.',
  'Uma reserva de emergência é o melhor presente para o seu eu do futuro.',
  'Gaste com o que importa para você e corte sem culpa o resto.',
  'Dívida cara primeiro: quite os juros mais altos antes de investir.',
  'Parcelar não é de graça: some o total antes de decidir.',
  'Constância vale mais que valor: guardar pouco todo mês já muda o jogo.',
  'Revise suas assinaturas: o que você não usa mais ainda é cobrado.',
  'Compare o preço com as horas de trabalho que ele custou.',
  'Meta com data vira plano; meta sem data vira desejo.',
  'Ganhou um extra? Divida entre quitar, guardar e aproveitar um pouco.',
  'Fatura do cartão também é planejamento: veja antes de ela chegar.',
  'Ter margem no orçamento é ter tranquilidade.',
  'Gastar menos do que ganha é a base de toda a vida financeira.',
  'Hoje é um bom dia para conferir o que já entrou e o que ainda vai sair.',
  'Você não precisa de muito para começar, só de começar.',
  'Misture prazer e disciplina: reserve um valor para se divertir sem culpa.',
  'Mercado com lista e sem fome costuma custar menos.',
  'Cada real guardado é uma escolha que o futuro agradece.',
  'Organização financeira é um hábito, não uma tarefa de uma vez só.',
  'Renegociar uma dívida pode custar uma conversa e economizar meses de juros.',
  'Olhe o mês inteiro, não só o saldo de hoje.',
  'Dinheiro com destino rende mais que dinheiro solto.',
  'Não compare seu começo com o meio da história de outra pessoa.',
  'Conhecer seus números tira o medo do dinheiro.',
  'Pequeno ajuste hoje, grande diferença no fim do ano.',
  'O orçamento diz ao dinheiro para onde ir, em vez de deixar você perguntar para onde ele foi.',
  'Comprar com desconto algo que você não precisa ainda é um gasto desnecessário.',
  'Um passo para trás para quitar uma dívida é o impulso necessário para dar dez passos à frente nos investimentos.',
  'Não encare o controle como restrição, mas como o mapa exato da sua liberdade financeira.',
  'O melhor rendimento que o seu dinheiro pode comprar é uma noite de sono tranquilo.',
  'Riqueza é aquilo que não se vê: a compra evitada, a dívida não feita e o dinheiro investido.',
  'A consistência de poupar um pouco todo mês sempre vencerá a tentativa de acertar a "tacada de mestre".',
  'Um imprevisto financeiro não define o seu futuro; o que define é a rapidez com que você ajusta a rota.',
  'Construindo patrimônio, uma decisão consciente por vez.',
  'Hoje é um excelente dia para fazer o seu dinheiro trabalhar por você.',
  'Transformando anotações em controle, e controle em liberdade.'
];

// `random` is injectable so the choice can be tested.
export function pickFinanceQuote(random: () => number = Math.random): string {
  const index = Math.min(Math.floor(random() * FINANCE_QUOTES.length), FINANCE_QUOTES.length - 1);
  return FINANCE_QUOTES[index];
}

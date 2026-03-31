# **App Name**: Hall Black Club

## Core Features:

- Entrada de Código Mítico e Ativação (Login/Cadastro): Uma tela de entrada imaculada onde os usuários inserem seu 'Código Mítico' para iniciar o processo de acesso e ativação de sua filiação ao clube. Esta tela funciona como o ponto de login e o gatilho para o registro inicial do perfil do usuário.
- Validação e Gestão de Chaves Míticas: Uma função serverless que valida com segurança o código inserido contra o banco de dados de chaves autorizadas no Firestore. Se o código for 'disponível', ele é marcado como 'ativado' e um perfil de usuário persistente é criado/associado, efetivando o 'cadastro' do membro e garantindo acesso de uso único.
- Lógica de Controle de Acesso e Perfil de Membro: Gerenciamento robusto no Firestore para armazenar códigos míticos e seus status ('disponível' ou 'ativado'), e para associar dados de perfil de membro ao código ativado, garantindo acesso exclusivo e persistência de dados após o 'cadastro'.
- Feedback Dinâmico de Acesso: Feedback visual imediato sobre a validação do código, concedendo acesso ou exibindo uma mensagem de erro como 'Chave Inválida ou Já Utilizada'.
- Exibição do Dashboard Mítico: Após a autenticação bem-sucedida, o sistema exibe um dashboard personalizado sem recarregar a página, apresentando uma mensagem 'BEM-VINDO À ELITE', um badge 'STATUS MÍTICO' com um ícone de coleira, uma animação de brilho Rubi, e funcionalidades adicionais como ranking, perfil público e cadastro de pet.
- Link Externo para Monitoramento de Pet: Um botão elegante ('Monitorar Saúde (Mundo Pet) 🐾') para navegar com segurança os usuários para o aplicativo externo 'Mundo Pet' em uma nova aba do navegador.

## Style Guidelines:

- Cor primária: Um vermelho Rubi rico e profundo (#A01029) para significar luxo e exclusividade, contrastando fortemente com o fundo escuro.
- Cor de fundo: 'Preto Absoluto' puro (#000000) para uma experiência escura, sofisticada e imersiva, conforme explicitamente solicitado pelo usuário.
- Cor de destaque: Um vermelho Rubi vibrante e luminoso (#ED0A39) para realçar elementos interativos, indicando estados de foco e animações-chave, criando um efeito de 'brilho'.
- Fonte do corpo e título: 'Poppins' (sans-serif) para uma estética moderna, precisa e vanguardista que se alinha com o conceito do clube de luxo.
- O dashboard deve apresentar um badge circular exibindo um ícone claro e elegante de uma coleira, incorporando o 'STATUS MÍTICO'.
- Um sutil emoji de pata (🐾) ou ícone será usado no botão 'Mundo Pet' para reconhecimento imediato e sofisticação lúdica.
- A tela de login apresenta um layout limpo e minimalista com título, subtítulo e campo de entrada centralizados, enfatizando um processo de entrada simplificado.
- Implemente uma sutil animação de brilho vermelho Rubi para o botão 'REIVINDICAR ACESSO' no hover e para o texto 'BEM-VINDO À ELITE' após o login bem-sucedido para realçar a sensação mística e exclusiva.
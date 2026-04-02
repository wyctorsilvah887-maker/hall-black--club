# Hall Black Club | Mythic Elite

Este é o sistema de elite do **Hall Black Club**, desenvolvido com Next.js 15, Firebase e Tailwind CSS.

## 🚀 Como subir para o GitHub

Para versionar este projeto no seu repositório, execute os seguintes comandos no seu terminal:

1. **Inicie o Git:**
   ```bash
   git init
   ```

2. **Adicione os arquivos:**
   ```bash
   git add .
   ```

3. **Faça o commit inicial:**
   ```bash
   git commit -m "Initial commit: Hall Black Club Elite System"
   ```

4. **Conecte ao seu repositório remoto:**
   ```bash
   git remote add origin https://github.com/wyctorsilvah887-maker/hall-black--club.git
   ```

5. **Envie os arquivos:**
   ```bash
   git branch -M main
   git push -u origin main
   ```

## 🔑 Gerenciamento de Chaves (Firestore)

Para que um código funcione, você deve cadastrá-lo na coleção `mythicCodes` no seu Console do Firebase. 
**Importante:** Use o próprio código como o **ID do Documento**.

### Campos obrigatórios por documento:
- `status`: (string) "available"
- `status_rank`: (string) "MYTHIC", "AMBER" ou "LEGENDARY"
- `theme`: (string) "mythic", "amber" ou "legendary"

### Sugestão de 10 Códigos Iniciais:
1. `HB-24-MYTH-X01` (Mítico - Rubi)
2. `HB-24-MYTH-K99` (Mítico - Rubi)
3. `HB-24-MYTH-Z77` (Mítico - Rubi)
4. `HB-24-MYTH-B12` (Mítico - Rubi)
5. `HB-24-MYTH-R50` (Mítico - Rubi)
6. `HB-24-AMBER-L33` (Status Legendário - Âmbar)
7. `HB-24-AMBER-P10` (Status Legendário - Âmbar)
8. `HB-24-AMBER-V07` (Status Legendário - Âmbar)
9. `HB-24-GOLD-Q88` (Status Lendário - Ouro)
10. `HB-24-GOLD-A42` (Status Lendário - Ouro)

## 🛠️ Tecnologias Utilizadas

- **Framework:** Next.js 15 (App Router)
- **Estilização:** Tailwind CSS + ShadCN UI
- **Backend:** Firebase (Firestore & Authentication)
- **Animações:** Framer Motion / CSS Keyframes Cinematográficos

## 📄 Licença

Uso exclusivo para membros da rede **Hall Black**.

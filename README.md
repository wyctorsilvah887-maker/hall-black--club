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

### Campos obrigatórios por documento (Case-Sensitive):
1. **ID do Documento:** (O próprio código, ex: `HB-24-GOLD-X01`)
2. `status`: `available` (Status de disponibilidade, digite sem aspas)
3. `status_rank`: `MYTHIC`, `AMBER` ou `LEGENDARY` (Define o título do membro)
4. `theme`: `mythic`, `amber` ou `legendary` (Define a cor da interface)

### 🏆 Lista de 20 Códigos LENDÁRIOS (Ouro):
Estes códigos ativam o tema Dourado e o status de maior prestígio.
- `HB-24-GOLD-X01`
- `HB-24-GOLD-B22`
- `HB-24-GOLD-Z99`
- `HB-24-GOLD-K33`
- `HB-24-GOLD-R55`
- `HB-24-GOLD-P11`
- `HB-24-GOLD-M07`
- `HB-24-GOLD-T12`
- `HB-24-GOLD-Y44`
- `HB-24-GOLD-W10`
- `HB-24-GOLD-S88`
- `HB-24-GOLD-V15`
- `HB-24-GOLD-F20`
- `HB-24-GOLD-G25`
- `HB-24-GOLD-H30`
- `HB-24-GOLD-J35`
- `HB-24-GOLD-L40`
- `HB-24-GOLD-N45`
- `HB-24-GOLD-Q50`
- `HB-24-GOLD-C55`

### 💎 Lista de 10 Códigos MÍTICOS / ÂMBAR:
- `HB-24-MYTH-X01` (Mítico)
- `HB-24-MYTH-K99` (Mítico)
- `HB-24-MYTH-Z77` (Mítico)
- `HB-24-MYTH-B12` (Mítico)
- `HB-24-MYTH-R50` (Mítico)
- `HB-24-AMBER-L33` (Âmbar)
- `HB-24-AMBER-P10` (Âmbar)
- `HB-24-AMBER-V07` (Âmbar)
- `HB-24-GOLD-Q88` (Lendário)
- `HB-24-GOLD-A42` (Lendário)

## 🛠️ Tecnologias Utilizadas

- **Framework:** Next.js 15 (App Router)
- **Estilização:** Tailwind CSS + ShadCN UI
- **Backend:** Firebase (Firestore & Authentication)
- **Animações:** Framer Motion / CSS Keyframes Cinematográficos

## 📄 Licença

Uso exclusivo para membros da rede **Hall Black**.

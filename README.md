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

## 🔑 Estrutura das Chaves (Mythic Codes)

Os códigos seguem o padrão `HB-[ANO]-[NÍVEL]-[ID]`. O "24" refere-se ao ano de 2024.
Para que um código funcione, você deve cadastrá-lo na coleção `mythicCodes` no seu Console do Firebase. 
**Importante:** Use o próprio código como o **ID do Documento**.

### Campos obrigatórios por documento (Case-Sensitive):
1. **ID do Documento:** (O próprio código, ex: `HB-24-GOLD-X01`)
2. `status`: `available` (Sem aspas, tudo minúsculo. O sistema limpa aspas automáticas se inseridas por erro)
3. `status_rank`: `MYTHIC`, `AMBER` ou `LEGENDARY` (Define o título do membro)
4. `theme`: `mythic`, `amber` ou `legendary` (Define a cor da interface)

---

### 👑 Nível 1: LENDÁRIO (Ouro/Gold)
**Configuração:** `status_rank: LEGENDARY` | `theme: legendary`
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

### 🔥 Nível 2: LEGENDÁRIO ÂMBAR (Laranja/Amber)
**Configuração:** `status_rank: AMBER` | `theme: amber`
- `HB-24-AMBR-X01`
- `HB-24-AMBR-B22`
- `HB-24-AMBR-Z99`
- `HB-24-AMBR-K33`
- `HB-24-AMBR-R55`
- `HB-24-AMBR-P11`
- `HB-24-AMBR-M07`
- `HB-24-AMBR-T12`
- `HB-24-AMBR-Y44`
- `HB-24-AMBR-W10`
- `HB-24-AMBR-S88`
- `HB-24-AMBR-V15`
- `HB-24-AMBR-F20`
- `HB-24-AMBR-G25`
- `HB-24-AMBR-H30`
- `HB-24-AMBR-J35`
- `HB-24-AMBR-L40`
- `HB-24-AMBR-N45`
- `HB-24-AMBR-Q50`
- `HB-24-AMBR-C55`

### 💎 Nível 3: MÍTICO (Rubi/Red)
**Configuração:** `status_rank: MYTHIC` | `theme: mythic`
- `HB-24-MYTH-X01`
- `HB-24-MYTH-K99`
- `HB-24-MYTH-Z77`
- `HB-24-MYTH-B12`
- `HB-24-MYTH-R50`
- `HB-24-MYTH-L33`
- `HB-24-MYTH-P10`
- `HB-24-MYTH-V07`
- `HB-24-MYTH-Q88`
- `HB-24-MYTH-A42`

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** Next.js 15 (App Router)
- **Estilização:** Tailwind CSS + ShadCN UI
- **Backend:** Firebase (Firestore & Authentication)
- **Animações:** Framer Motion / CSS Keyframes Cinematográficos

## 📄 Licença

Uso exclusivo para membros da rede **Hall Black**.
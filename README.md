# Sovereign Founders Club | Apex Elite

Este é o sistema de elite do **Sovereign Founders Club**, desenvolvido com Next.js 15, Firebase e Tailwind CSS.

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
   git commit -m "Initial commit: Sovereign Founders Club Elite System"
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

## 🔑 Estrutura das Chaves (Mythic Codes) - 2026

**IMPORTANTE:** Todos os códigos devem ser criados na MESMA coleção: `mythicCodes`.
Os códigos seguem o padrão `HB-26-[NÍVEL]-[ID]`. O "26" refere-se ao ano de 2026.

### Campos obrigatórios por documento (Case-Sensitive):
1. **ID do Documento:** (O próprio código, ex: `HB-26-GOLD-X01`)
2. `status`: `available` (Sem aspas, tudo minúsculo)
3. `status_rank`: `MYTHIC`, `AMBER` ou `LEGENDARY` (Define o título do membro)
4. `theme`: `mythic`, `amber` ou `legendary` (Define a cor da interface)

---

### 👑 Nível 1: LENDÁRIO (Ouro/Gold) - 30 VAGAS
**Configuração:** `status_rank: LEGENDARY` | `theme: legendary`
- `HB-26-GOLD-X01` até `HB-26-GOLD-L20` (Total 30 códigos)
- IDs: X01, B22, Z99, K33, R55, P11, M07, T12, Y44, W10, S88, V15, F20, G25, H30, J35, L40, N45, Q50, C55, A11, D22, E33, F44, G55, H66, I77, J88, K10, L20.

### 🔥 Nível 2: LEGENDÁRIO ÂMBAR (Laranja/Amber) - 20 VAGAS
**Configuração:** `status_rank: AMBER` | `theme: amber`
- `HB-26-AMBR-X01`
- IDs: X01, B22, Z99, K33, R55, P11, M07, T12, Y44, W10, S88, V15, F20, G25, H30, J35, L40, N45, Q50, C55.

### 💎 Nível 3: MÍTICO (Rubi/Red) - 10 VAGAS
**Configuração:** `status_rank: MYTHIC` | `theme: mythic`
- `HB-26-MYTH-X01`
- IDs: X01, K99, Z77, B12, R50, L33, P10, V07, Q88, A42.

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** Next.js 15 (App Router)
- **Estilização:** Tailwind CSS + ShadCN UI
- **Backend:** Firebase (Firestore & Authentication)
- **Animações:** Framer Motion / CSS Keyframes Cinematográficos

## 📄 Licença

Uso exclusivo para membros da rede **Sovereign Founders**.

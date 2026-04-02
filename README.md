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

O sistema agora utiliza exclusivamente **Códigos Únicos**. Para que um código funcione, você deve cadastrá-lo na coleção `mythicCodes` no seu Console do Firebase com os seguintes campos:

- `code`: (String) O código da chave.
- `status`: (String) "available"
- `status_rank`: (String) "MYTHIC", "AMBER" ou "LEGENDARY"
- `theme`: (String) "mythic", "amber" ou "legendary"

### Sugestão de 10 Códigos Iniciais:
1. `HB-24-MYTH-X01`
2. `HB-24-MYTH-K99`
3. `HB-24-MYTH-Z77`
4. `HB-24-MYTH-B12`
5. `HB-24-MYTH-R50`
6. `HB-24-MYTH-L33`
7. `HB-24-MYTH-P10`
8. `HB-24-MYTH-V07`
9. `HB-24-MYTH-Q88`
10. `HB-24-MYTH-A42`

## 🛠️ Tecnologias Utilizadas

- **Framework:** Next.js 15 (App Router)
- **Estilização:** Tailwind CSS + ShadCN UI
- **Backend:** Firebase (Firestore & Authentication)
- **Animações:** Framer Motion / CSS Keyframes Cinematográficos

## 📄 Licença

Uso exclusivo para membros da rede **Hall Black**.

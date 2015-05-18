# ZUP Web
***
### Requisitos
* [Node.js](https://nodejs.org/download)

### Ambiente de desenvolvimento
1. Na pasta do projeto, execute `npm install` (`sudo` será necessário as vezes) e, em seguida, `bower install` para instalar todas as dependências do *npm*.

2. Crie um arquivo *.env* na raiz do projeto com o seguinte conteúdo:
```
API_URL=http://zup-staging.cognita.ntxdev.com.br
MAP_LAT=-23.549671
MAP_LNG=-46.6321713
MAP_ZOOM=13
```
3. Execute `grunt serve` para iniciar o servidor

4. O ZUP Web estará acessível a partir da URL: [http://localhost:9000](http://localhost:9000)
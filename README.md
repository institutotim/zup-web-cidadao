# ZUP Cidadão Web

### Requisitos
* [Node.js](https://nodejs.org/download) 0.10

### Instalação de dependências
Na pasta do projeto, execute `npm install` e, em seguida, `bower install` para instalar todas as dependências do projeto.

### Configuração
Crie um arquivo *.env* na raiz do projeto com o seguinte conteúdo:
```
API_URL=https://url-da-sua-api.org.br
MAP_LAT=-23.549671
MAP_LNG=-46.6321713
MAP_ZOOM=13
PAGE_TITLE=Meu ZUP
GOOGLE_ANALYTICS_KEY=UA-XXXXX-XX
```

`PAGE_TITLE` é o título usado na página e `GOOGLE_ANALYTICS_KEY` pode ser usado para colher estatísticas de acesso.

`MAP_LAT` e `MAP_LNG` apontam para o local onde o mapa será centralizado. `MAP_ZOOM` indica o nível do zoom, conforme
definido pela [API do Google Maps](https://developers.google.com/maps/documentation/javascript/tutorial#zoom-levels).

### Criação de build para produção
Execute o seguinte comando:

```
grunt build
```

Após isso a pasta `dist` conterá a raiz do projeto pronta para ser colocado em um servidor web de sua preferência.


### Servidor de desenvolvimento local
Execute `grunt serve` para iniciar o servidor de desenvolvimento.

O ZUP Cidadão Web estará acessível a partir da URL: [http://localhost:9000](http://localhost:9000)

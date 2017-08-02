## ZUP Cidadão Web

    < ZUP Cidadão Web >
    Copyright (C) <2016> <Instituto TIM>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
    
--- 

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

# ZUP Web

### Requirements

* [Node.js](https://nodejs.org/download)

### Development environment
1. In the project folder, run `npm install` (`sudo` will be required sometimes) and then `bower install` to install all of the *npm* dependencies.

2. Create a *.env* file in the root of the project with the following content: 

```
API_URL=http://zup-staging.cognita.ntxdev.com.br
MAP_LAT=-23.549671
MAP_LNG=-46.6321713
MAP_ZOOM=13
```

1. Run `grunt serve` to start the server

2. ZUP Web will be accessible from URL: [http://localhost:9000](http://localhost:9000)
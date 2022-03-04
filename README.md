# VI - Information Visualization

This repository contains the project developed for [Information Visualization](https://www.ua.pt/en/uc/6495).

The goal of the project is to build a product to visualize data related to covid.

## How to run the application

In order to be able to see the plots, it is necessary to run the application with a server:

```bash
python3 -m http.server 8888
```

Alternatively, the vscode extension [Five Server (Live Server)](https://marketplace.visualstudio.com/items?itemName=yandeu.five-server) can be used to run the server.

## Plots

Each page of the application has a plot:

- `/index.html`: Map plot;
- `/line-plot.html`: Line plot;
- `/bar-plot.html`: Bar plot.

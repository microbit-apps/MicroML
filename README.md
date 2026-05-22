# MicroML
A nascent microbit-app for training neural networks, inspired by [create.ai](https://createai.microbit.org/)

Based on the [example app template](https://microbit-apps.org/example/example).

## Building
Due to the C++ backend compilation may take a while if you compile with mkc. Thus pxt compilation is recommended instead:

```
pxt target microbit
pxt install
pxt build --local
```

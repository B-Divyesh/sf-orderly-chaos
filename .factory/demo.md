# Demo sandbox

Open `https://orderly-chaos.sociobot.in/demo` or select **Try it with sample
data** on the first screen.

The demo loads a complete six-object sample case. It has a fixed
hidden order, a free starting clue, nine comparison tokens, active movement
controls, and both win and loss endings. The sample is useful without an
account or purchase.

Demo state uses only `localStorage` key `demo:orderly-chaos:game`. The normal
solo key is `orderly-chaos:game`; demo code never reads or writes it. **Reset
demo** recreates the fixed sample. **Start for real** removes the demo key and
starts the free case in the normal namespace.

The claim tests start in a fresh browser context and use only `/demo`. The
two-player claim creates a new expiring room through the product-owned local
test server; it does not use production data.

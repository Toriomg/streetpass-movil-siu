
#import "@preview/simplebnf:0.1.2": *
#import "@preview/cetz:0.3.4": canvas, draw, tree
#import "@preview/finite:0.5.0": automaton
#import "@preview/codly:1.3.0": *
#import "@preview/codly-languages:0.1.1": *

#import "uc3mreport.typ": conf
#import "config.typ": project_data
#import "lib.typ": *

#let azuluc3m = rgb("#000e78")
#show: codly-init.with()
#codly(number-format: none)
#codly(zebra-fill: none)
#codly(display-icon: false)
#codly(display-name: false)
#show raw: set text(font: "Inconsolata Nerd Font", size: 10pt, fill: azuluc3m)
#codly(
  fill: rgb("#ffffff"),      // Color de fondo del bloque
  stroke: 1pt + rgb("#ccc"),
  radius: 3pt,
)


#set math.equation(numbering: "(1)")
#show list.item: it => block(it, above: 0.6em, below: 0.6em)
#show: conf.with(..project_data)

= Ejemplos:

== Ejemplos de gramáticas en BNF.

=== BNF simple
#bnf(
  Prod(
    $e$,
    {
      Or[$x$][_variable_]
      Or[$λ x.e$][_abstraction_]
      Or[$e$ $e$][_application_]
    },
  ),
)

#underline[NOTA:] si usas VsCode o Typst en el navegacor copia y pega líneas para las proucciones con Ctrl + C sin tener nada seleccionado.

=== BNF usando flechas y con más de una producción.

#bnf(
  Prod(
    $e$,
    delim: $→$,
    {
      Or[$x$][variable]
      Or[$λ x: τ.e$][abstraction]
      Or[$e space e$][application]
      Or[$λ τ.e space e$][type abstraction]
      Or[$e space [τ]$][type application]
    },
  ),
  Prod(
    $τ$,
    delim: $→$,
    {
      Or[$X$][type variable]
      Or[$τ → τ$][type of functions]
      Or[$∀X.τ$][universal quantification]
    },
  ),
)

=== Múltiples BNF en formato de rejilla.

#let esc(e) = $\\ #h(0pt) #e$
#grid(
  columns: (auto, auto),
  gutter: 4%,
  bnf(
    Prod($r$, {
      Or[$epsilon$][Epsilon]
      Or[$c d$][Character descriptor]
      Or[$r_1 r_2$][Sequence]
      Or[$r_1|r_2$][Disjunction]
      Or[$(r)$][Capturing group]
      Or(esc($g$))[Backreference]
      Or[$r? #h(0pt) gamma$][$r #h(0pt) + #h(0pt) gamma$][$r #h(0pt) * #h(0pt) gamma$][Quantifiers]
      Or[$a$][Anchor]
      Or[$(? #h(0pt) l a thick r)$][Lookaround]
    }),
    Prod($gamma$, {
      Or[$$][Greedy]
      Or[$?$][Lazy]
    }),
    Prod($l k$, {
      Or[$=$][Positive lookahead]
      Or[$!$][Negative lookahead]
      Or[$\<=$][Positive lookbehind]
      Or[$< #h(0pt) !$][Negative lookbehind]
    }),
  ),
  bnf(
    Prod($c d$, {
      Or[$c$][Single character]
      Or[$[c_1 #h(0pt) - #h(0pt) c_2]$][Range]
      Or[$[c d_1 c d_2]$][Union]
      Or[$dot$][Dot]
      Or[$esc("w")$][$esc("W")$][$esc("d")$][$esc("D")$][$esc("s")$][$esc("S")$][$esc("p"){"property"}$][$esc("P"){"property"}$][Character classes]
      Or[$[\^c d]$][Inversion]
      Or[$[\^]$][All]
      Or[$[thin]$][Empty]
    }),
    Prod($a$, {
      Or[$\^$][Start]
      Or[$\$$][End]
      Or[$esc("b")$][Word boundary]
      Or[$esc("B")$][Non-word boundary]
    }),
  ),
)

== Árboles
Ejemplos de árboles

#canvas({
  import draw: *
  set-style(content: (padding: .1))
  tree.tree(([Rot], ([A], ([b], [f]), [c]), ([d], [e])))
})

#canvas({
  import draw: *
  set-style(content: (padding: .1))
  tree.tree((
    [E],
    ([E], [+], [T]),
    ([T], [id]),
  ))
})

== Autómatas

#automaton((
  q0: (q1: 0, q0: "0,1"),
  q1: (q0: (0, 1), q2: "0"),
  q2: (),
))

#automaton(
  (
    q0: (q1: 0, q0: "0,1"),
    q1: (q0: (0, 1), q2: "0"),
    q2: (),
  ),
  initial: "q1",
  final: ("q0", "q2"),
  labels: (
    q2: "FIN",
  ),
  style: (
    state: (fill: luma(248), stroke: luma(120)),
    transition: (stroke: (dash: "dashed")),
    q0-q0: (anchor: top + left),
    q1: (initial: top),
    q1-q2: (stroke: 2pt + red),
  ),
)

== Código

```Rust
pub fn main() {
    println!("Hello, world!");
}
```
#linebreak()

```python
def main():
  print("macarrones con tomatico frito")
```
#linebreak()


```C
int main(){
  printf("Hello world!");
  return 0;
}
```
#linebreak()

=== Código de terminal: Bash

#codly(languages: codly-languages)
```Bash
$> cowsay macarrones con chorizo
 ________________________
< macarrones con chorizo >
 ------------------------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
```
#grid(
	columns: (1fr,1fr),
	bnf(
		Prod(
		$S$,
		{
			Or[$λ$][]
			Or[$E $`\n`][]
		},
		),
		Prod(
		$E$,
		{
			Or[$(O P P)$][]
			Or[$N$][]
			Or[variable?][TODO]
		},
		),
		Prod(
		$O$,
		{
			Or[$+$][_token_]
			Or[$-$][_token_]
			Or[$*$][_token_]
			Or[$\/$][_token_]
		},
		),
	),
	bnf(
		Prod(
		$P$,
		{
			Or[$N$][]
			Or[$E$][]
		},
		),
		Prod(
		$N$,
		{
			Or[$N'N$][]
			Or[0|1|2| ... |9][_token_]
		},
		),
		Prod(
		$N'$,
		{
			Or[1|2|3| ... |9][_token_]
		},
		),
	)
)




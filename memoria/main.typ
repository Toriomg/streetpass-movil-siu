
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

#include "content/intro.typ"
#include "content/specs.typ"
#include "content/implement.typ"
#include "content/experimental.typ"
#include "content/iteraciones.typ"

== Autómatas

#automaton((
  "Reloj": ("Info": none),
  "Perfil": ("Match": none),
  "Match": ("Conexión": none),
  "Conexión": (),
  "Info": ("Reloj": none),
))

/*
ejemplo
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
*/



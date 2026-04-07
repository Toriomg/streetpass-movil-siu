
#import "@preview/simplebnf:0.1.2": *
#import "@preview/cetz:0.3.4": canvas, draw, tree
#import "@preview/finite:0.5.0": automaton
#import "@preview/codly:1.3.0": *
#import "@preview/codly-languages:0.1.1": *

#import "uc3mreport.typ": conf
#import "config.typ": project_data

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
#include "content/ia.typ"
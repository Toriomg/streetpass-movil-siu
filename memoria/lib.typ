
#let create_indexed_set(base_letter, count) = {
  $
    { #base_letter
  _1, #base_letter
  _2, ..., #base_letter
  _#count }
  $
}

// --- FUNCIONES GENERADORAS ---


#let math_func(formula, label) = {
  math.equation(
    block: true,
    $#formula$
  )
}

// --- DEFINICIONES DE ECUACIONES ---
#let variable1 = math_func(
  $X = { x_(i,j) | 1 <= i <= n, 1 <= j <= n }$, "variable1"
)

#let variable2 = math_func(
  $x_(i,j) #sym.lt.gt "estado de la casilla" (i,j) "del tablero."$, "variable2"
)

#let correspondencia = math_func(
  $0 --> "Blanco"(O) " y " 1 --> "Blanco"(X)$, "correspondencia"
)

#let dominio = math_func(
  $D(x_(i,j)) = {0,1}$, "dominio"
)

#let rest1_1 = math_func(
  $forall i : sum_(j=1)^(n) x_(i,j) = n / 2$, "rest1_1"
)

#let rest1_2 = math_func(
  $forall j : sum_(i=1)^(n) x_(i,j) = n / 2$, "rest1_2"
)

#let rest2_1 = math_func(
  $forall i, forall j in {1, ..., n - 2} : overline(x_(i,j) = x_(i,j+1) = x_(i,j+2))$, "rest2_1"
)

#let rest2_2 = math_func(
  $forall j, forall i in {1, ..., n - 2} : overline(x_(i,j) = x_(i+1,j) = x_(i+2,j))$, "rest2_2"
)

#let estados = math_func(
  $S equiv V = {s_1, s_2, ... , s_n }$, "estados"
)

#let estado = math_func(
  $n lt.gt "número total de vértices en el mapa"$, "estado"
)

#let precondiciones = math_func(
  $(u,v) in E$, "precondiciones"
)

#let postcondiciones = math_func(
  $s_(t+1) = v | s_t = u$, "postcondiciones"
)

#let dominiodisc = math_func(
  $forall(u,v) in E, c(u,v) in NN$, "dominiodisc"
)

#let acotacion = math_func(
  $"Existe una constante" W_(max) | forall(u,v) in E, c(u,v) <= W_(max)$, "acotacion"
)

#let circbuff = math_func(
  $Phi(n) = f(s) " "mod (W_max + 1)$, "circbuff"
)
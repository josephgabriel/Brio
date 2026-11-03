#!/usr/bin/env bash
# Lista suspeitas de problema em tela pequena. Rode de novo a cada tela nova.
cd "$(dirname "$0")/.." || exit 1
secao() { printf '\n== %s ==\n' "$1"; }

secao "Grades com 3+ colunas sem versão responsiva"
grep -rnE "grid-cols-[3-9]\b" src --include=*.tsx | grep -vE "(sm|md|lg|xl):grid-cols"

secao "Grades de 2 colunas (ok se o conteúdo for curto; confira campos de formulário)"
grep -rnE "grid-cols-2\b" src --include=*.tsx | grep -vE "(sm|md|lg|xl):grid-cols"

secao "Larguras fixas grandes"
grep -rnE "\bw-(64|72|80|96)\b|w-\[[0-9]{3,}px\]|min-w-\[[0-9]{3,}px\]" src --include=*.tsx

secao "Altura da tela em vh (use dvh)"
grep -rnE "\b(min-)?h-screen\b|100vh" src --include=*.tsx --include=*.css

secao "Espaçamento grande sem versão para celular"
grep -rnE "\bp[xy]?-(6|8|10|12)\b" src --include=*.tsx | grep -vE "(sm|md|lg|xl):p"

secao "Textos grandes sem versão para celular"
grep -rnE "\btext-(4|5|6)xl\b" src --include=*.tsx | grep -vE "(sm|md|lg|xl):text-"

secao "Linhas com justify-between sem quebra (título + botões)"
grep -rn "justify-between" src --include=*.tsx | grep -v "flex-wrap"

secao "Tabelas (devem estar dentro de overflow-x-auto)"
grep -rn "<table" src --include=*.tsx

secao "whitespace-nowrap (pode empurrar a largura)"
grep -rn "whitespace-nowrap" src --include=*.tsx
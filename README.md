# Ziel: Markov-Chain Simnulation von Covid19
Mittels einer Markov-Chain wird die Ausbreitung von Covid19 innerhalb einer Population von 480 Personen simuliert.

## Den Personen stehen sechs Orte zur Verfügung:
1. Das eigene Zuhause (60) mit 8 Personen in einem Haus
2. Öffentliche Transportmittel (3)
3. Krankenhaus (1)
4. Schulen (1)
5. Büros (4)
6. Supermärkte (3)

## Folgende Annahmen gelten:
- CFR (case fatality rate) von 2% [2% aller Infizierten sterben an der Krankheit]
- Bei Kontakt mit einem Infizierten stecken sich 15% aller gesunden Personen an
- Die Agents verlassen mir einer Wahrscheinlichkeit von 10% je Tick ihr Haus
- Ein Tick entspricht 2,5 Sekunden


## Folgende Parameter können angepasst werden:
- Die Anzahl der initialen Kranken
- Die Anzahl der einzelnen Gebäude



# Verbesserungen

-[] Inkubationszeit mit einberechnen
-[] Lock-Down Szenarien mit einplanen
-[] Krankheitsverlauf mit einberechnen (20 schwere Sympthone -> gehen ins Krankenhaus, von den verbliebenden 80% gehen auch 25% ins Krankenhaus)


-[] Vorerkrankungen mit einbeziehen
-[] ICU-Beds und Max-Cap mit einbauen
-[] Bewegungsrate "kranker" minimieren
-[] Mehrfamilienhäuser und Mehrparteienhäuser mit einbauen
-[] Rate der "Ansteckungsgefahr" dynamisch anpassen (In Krankenhäusern eher weniger, Büro usw. mehr, Haushalt hoch)
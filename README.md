# Ziel: Markov-Chain Simnulation von Covid19 innerhalb einer Gemeinde
Anhand von 300 Agents wird eine Ausbreitung von Covid19 innerhalb der Population simuliert.

Den Agents stehen sechs Orte zur Verfügung:
1. Das eigene Zuhause (60) -> 5 Personen in einem Haus
2. Öffentliche Transportmittel (3)
3. Krankenhaus (1)
4. Schulen (1)
5. Büros (5)
6. Supermärkte (2)

Folgende Annahmen gelten:
* CFR (case fatality rate) von 2% [2% aller Infizierten sterben an der Krankheit]
* Bei Kontakt mit einem Infizierten stecken sich 15% aller gesunden Personen an
* Die Agents haben eine 10% Chance zu sich bewegen


Folgende Parameter können angepasst werden:




# Verbesserungen

## Easy
[] Temple durch Büros und Schulen ersetzen
[] Grid vergrößern und die Population auf 500 erhöhen

## Middle
[] Markov-Kalkulation in Worker-Thread auslagern
[] Inkubationszeit mit einberechnen
[] Lock-Down Szenarien mit einplanen
[] Transitions vermehrt über Bus-Stations
[] Keiner geht "nur" zur Busstation -> muss zu einem neuen Punkt und darf nicht zurück
[] Krankheitsverlauf mit einberechnen (20 schwere Sympthone -> gehen ins Krankenhaus, von den verbliebenden 80% gehen auch 25% ins Krankenhaus)

## Hard
[] Vorerkrankungen mit einbeziehen
[] ICU-Beds und Max-Cap mit einbauen
[] Bewegungsrate "kranker" minimieren
[] Mehrfamilienhäuser und Mehrparteienhäuser mit einbauen
[] Rate der "Ansteckungsgefahr" dynamisch anpassen (In Krankenhäusern eher weniger, Büro usw. mehr, Haushalt hoch)
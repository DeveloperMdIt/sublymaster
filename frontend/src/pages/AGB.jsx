import React from 'react';
import { Link } from 'react-router-dom';

const AGB = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
                <Link to="/" className="text-indigo-600 hover:text-indigo-800 mb-6 inline-block">
                    ← Zurück zur Startseite
                </Link>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>

                <div className="space-y-6 text-gray-700">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">§ 1 Geltungsbereich</h2>
                        <p>
                            (1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend "AGB") der MD IT Solutions, An der Hohl 4,
                            36318 Schwalmtal (nachfolgend "Anbieter"), gelten für alle Verträge über die Nutzung der
                            Online-Plattform "Sublymaster" zur Erstellung von Designs für den Sublimationsdruck.
                        </p>
                        <p className="mt-2">
                            (2) Verbraucher im Sinne dieser AGB ist jede natürliche Person, die ein Rechtsgeschäft zu Zwecken
                            abschließt, die überwiegend weder ihrer gewerblichen noch ihrer selbständigen beruflichen Tätigkeit
                            zugerechnet werden können. Unternehmer ist eine natürliche oder juristische Person oder eine
                            rechtsfähige Personengesellschaft, die bei Abschluss eines Rechtsgeschäfts in Ausübung ihrer
                            gewerblichen oder selbständigen beruflichen Tätigkeit handelt.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">§ 2 Vertragsgegenstand</h2>
                        <p>
                            (1) Der Anbieter stellt dem Kunden eine webbasierte Software-Plattform zur Verfügung, mit der
                            Designs für den Sublimationsdruck erstellt, bearbeitet und gespeichert werden können.
                        </p>
                        <p className="mt-2">
                            (2) Die Nutzung der Plattform setzt eine Registrierung voraus. Mit der Registrierung kommt ein
                            Nutzungsvertrag zwischen dem Kunden und dem Anbieter zustande.
                        </p>
                        <p className="mt-2">
                            (3) Der Anbieter schuldet keine bestimmte Verfügbarkeit der Plattform. Der Anbieter ist berechtigt,
                            die Plattform jederzeit zu warten, zu aktualisieren oder vorübergehend außer Betrieb zu nehmen.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">§ 3 Registrierung und Vertragsschluss</h2>
                        <p>
                            (1) Die Registrierung erfolgt durch Angabe der erforderlichen Daten (E-Mail-Adresse, Name, Passwort)
                            und Bestätigung der Registrierung per E-Mail.
                        </p>
                        <p className="mt-2">
                            (2) Mit der Registrierung gibt der Kunde ein verbindliches Angebot zum Abschluss eines
                            Nutzungsvertrages ab. Der Anbieter nimmt dieses Angebot durch Freischaltung des Kundenkontos an.
                        </p>
                        <p className="mt-2">
                            (3) Der Kunde ist verpflichtet, seine Zugangsdaten geheim zu halten und vor dem Zugriff Dritter
                            zu schützen. Der Kunde haftet für alle Aktivitäten, die unter Verwendung seiner Zugangsdaten
                            vorgenommen werden, es sei denn, er hat die unbefugte Nutzung nicht zu vertreten.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">§ 4 Leistungsumfang und Nutzungsrechte</h2>
                        <p>
                            (1) Der Anbieter gewährt dem Kunden das nicht ausschließliche, nicht übertragbare Recht, die
                            Plattform während der Vertragslaufzeit zu nutzen.
                        </p>
                        <p className="mt-2">
                            (2) Der Kunde ist berechtigt, die mit der Plattform erstellten Designs für eigene kommerzielle
                            oder private Zwecke zu verwenden. Die Urheberrechte an den erstellten Designs verbleiben beim Kunden.
                        </p>
                        <p className="mt-2">
                            (3) Der Kunde ist nicht berechtigt, die Plattform zu dekompilieren, zu disassemblieren oder
                            anderweitig zurückzuentwickeln, es sei denn, dies ist gesetzlich ausdrücklich gestattet.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">§ 5 Preise und Zahlungsbedingungen</h2>
                        <p>
                            (1) Die Nutzung der Plattform kann kostenfrei oder kostenpflichtig sein, je nach gewähltem
                            Leistungsumfang. Die aktuellen Preise sind auf der Website des Anbieters einsehbar.
                        </p>
                        <p className="mt-2">
                            (2) Bei kostenpflichtigen Leistungen erfolgt die Abrechnung monatlich oder jährlich im Voraus,
                            je nach gewähltem Abrechnungsmodell.
                        </p>
                        <p className="mt-2">
                            (3) Die Zahlung erfolgt über die auf der Plattform angebotenen Zahlungsmethoden (z.B. Kreditkarte,
                            PayPal, Stripe).
                        </p>
                        <p className="mt-2">
                            (4) Bei Zahlungsverzug ist der Anbieter berechtigt, den Zugang zur Plattform zu sperren, bis die
                            ausstehenden Beträge beglichen sind.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">§ 6 Pflichten des Kunden</h2>
                        <p>
                            (1) Der Kunde verpflichtet sich, die Plattform nur für rechtmäßige Zwecke zu nutzen und keine
                            Inhalte hochzuladen oder zu verbreiten, die gegen geltendes Recht verstoßen.
                        </p>
                        <p className="mt-2">
                            (2) Der Kunde ist insbesondere verpflichtet, keine urheberrechtlich geschützten Werke Dritter
                            ohne entsprechende Berechtigung zu verwenden.
                        </p>
                        <p className="mt-2">
                            (3) Der Kunde stellt den Anbieter von allen Ansprüchen Dritter frei, die aufgrund einer
                            rechtswidrigen Nutzung der Plattform durch den Kunden entstehen.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">§ 7 Datensicherung</h2>
                        <p>
                            (1) Der Anbieter führt regelmäßige Datensicherungen durch. Eine Garantie für die vollständige
                            Wiederherstellung von Daten im Falle eines Datenverlustes kann jedoch nicht übernommen werden.
                        </p>
                        <p className="mt-2">
                            (2) Der Kunde wird empfohlen, regelmäßig eigene Sicherungskopien seiner Designs zu erstellen.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">§ 8 Haftung</h2>
                        <p>
                            (1) Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie für Schäden aus
                            der Verletzung des Lebens, des Körpers oder der Gesundheit.
                        </p>
                        <p className="mt-2">
                            (2) Bei leichter Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten
                            (Kardinalpflichten). In diesem Fall ist die Haftung auf den vertragstypischen, vorhersehbaren Schaden
                            begrenzt.
                        </p>
                        <p className="mt-2">
                            (3) Die Haftung nach dem Produkthaftungsgesetz bleibt unberührt.
                        </p>
                        <p className="mt-2">
                            (4) Im Übrigen ist die Haftung ausgeschlossen.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">§ 9 Laufzeit und Kündigung</h2>
                        <p>
                            (1) Der Vertrag wird auf unbestimmte Zeit geschlossen.
                        </p>
                        <p className="mt-2">
                            (2) Beide Parteien können den Vertrag jederzeit mit einer Frist von 14 Tagen zum Monatsende kündigen.
                        </p>
                        <p className="mt-2">
                            (3) Bei kostenpflichtigen Abonnements mit fester Laufzeit (z.B. Jahresabo) ist eine ordentliche
                            Kündigung erst zum Ende der Laufzeit möglich, sofern nicht anders vereinbart.
                        </p>
                        <p className="mt-2">
                            (4) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt. Ein wichtiger
                            Grund liegt insbesondere vor, wenn der Kunde gegen wesentliche Vertragspflichten verstößt.
                        </p>
                        <p className="mt-2">
                            (5) Die Kündigung bedarf der Textform (z.B. E-Mail).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">§ 10 Widerrufsrecht für Verbraucher</h2>
                        <p>
                            (1) Verbraucher haben ein gesetzliches Widerrufsrecht, über das wie folgt informiert wird:
                        </p>

                        <div className="bg-gray-100 p-4 rounded-lg mt-3">
                            <h3 className="font-semibold mb-2">Widerrufsbelehrung</h3>
                            <p className="font-semibold mt-2">Widerrufsrecht</p>
                            <p className="mt-1">
                                Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
                            </p>
                            <p className="mt-2">
                                Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
                            </p>
                            <p className="mt-2">
                                Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (MD IT Solutions, An der Hohl 4, 36318 Schwalmtal,
                                E-Mail: info@md-it-solutions.de) mittels einer eindeutigen Erklärung (z.B. ein mit der Post
                                versandter Brief oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.
                            </p>
                            <p className="mt-2">
                                Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des
                                Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
                            </p>

                            <p className="font-semibold mt-4">Folgen des Widerrufs</p>
                            <p className="mt-1">
                                Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten
                                haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die
                                Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
                            </p>
                        </div>

                        <p className="mt-3">
                            (2) Das Widerrufsrecht erlischt bei einem Vertrag über die Erbringung von Dienstleistungen, wenn
                            der Anbieter die Dienstleistung vollständig erbracht hat und mit der Ausführung der Dienstleistung
                            erst begonnen hat, nachdem der Verbraucher dazu seine ausdrückliche Zustimmung gegeben hat und
                            gleichzeitig seine Kenntnis davon bestätigt hat, dass er sein Widerrufsrecht bei vollständiger
                            Vertragserfüllung durch den Anbieter verliert.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">§ 11 Änderungen der AGB</h2>
                        <p>
                            (1) Der Anbieter behält sich vor, diese AGB jederzeit zu ändern, sofern dies erforderlich ist und
                            dem Kunden zumutbar ist.
                        </p>
                        <p className="mt-2">
                            (2) Über Änderungen wird der Kunde mindestens vier Wochen vor deren Inkrafttreten per E-Mail informiert.
                            Widerspricht der Kunde den Änderungen nicht innerhalb von vier Wochen nach Zugang der Änderungsmitteilung,
                            gelten die Änderungen als angenommen. Der Anbieter wird den Kunden in der Änderungsmitteilung auf sein
                            Widerspruchsrecht und die Bedeutung der Widerspruchsfrist hinweisen.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">§ 12 Schlussbestimmungen</h2>
                        <p>
                            (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Bei
                            Verbrauchern gilt diese Rechtswahl nur insoweit, als nicht der gewährte Schutz durch zwingende
                            Bestimmungen des Rechts des Staates, in dem der Verbraucher seinen gewöhnlichen Aufenthalt hat,
                            entzogen wird.
                        </p>
                        <p className="mt-2">
                            (2) Ist der Kunde Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches
                            Sondervermögen, ist ausschließlicher Gerichtsstand für alle Streitigkeiten aus diesem Vertrag der
                            Geschäftssitz des Anbieters.
                        </p>
                        <p className="mt-2">
                            (3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der
                            übrigen Bestimmungen hiervon unberührt.
                        </p>
                    </section>

                    <section className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Stand: {new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long' })}
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AGB;

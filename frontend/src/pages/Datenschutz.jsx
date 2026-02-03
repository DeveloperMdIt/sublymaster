import React from 'react';
import { Link } from 'react-router-dom';

const Datenschutz = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
                <Link to="/" className="text-indigo-600 hover:text-indigo-800 mb-6 inline-block">
                    ← Zurück zur Startseite
                </Link>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Datenschutzerklärung</h1>

                <div className="space-y-6 text-gray-700">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Datenschutz auf einen Blick</h2>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Allgemeine Hinweise</h3>
                        <p>
                            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten
                            passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie
                            persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen
                            Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Datenerfassung auf dieser Website</h3>
                        <p className="font-semibold mt-3">Wer ist verantwortlich für die Datenerfassung auf dieser Website?</p>
                        <p>
                            Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten
                            können Sie dem Impressum dieser Website entnehmen.
                        </p>

                        <p className="font-semibold mt-3">Wie erfassen wir Ihre Daten?</p>
                        <p>
                            Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B. um
                            Daten handeln, die Sie in ein Kontaktformular eingeben oder bei der Registrierung angeben.
                        </p>
                        <p className="mt-2">
                            Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere
                            IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder
                            Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten erfolgt automatisch, sobald Sie diese Website betreten.
                        </p>

                        <p className="font-semibold mt-3">Wofür nutzen wir Ihre Daten?</p>
                        <p>
                            Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten.
                            Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
                        </p>

                        <p className="font-semibold mt-3">Welche Rechte haben Sie bezüglich Ihrer Daten?</p>
                        <p>
                            Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer
                            gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung
                            oder Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt
                            haben, können Sie diese Einwilligung jederzeit für die Zukunft widerrufen. Außerdem haben Sie das
                            Recht, unter bestimmten Umständen die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten
                            zu verlangen. Des Weiteren steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.
                        </p>
                        <p className="mt-2">
                            Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit an uns wenden.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Hosting</h2>
                        <p>
                            Wir hosten die Inhalte unserer Website bei folgendem Anbieter:
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Externes Hosting</h3>
                        <p>
                            Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser Website erfasst werden,
                            werden auf den Servern des Hosters / der Hoster gespeichert. Hierbei kann es sich v.a. um IP-Adressen,
                            Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten, Namen, Websitezugriffe
                            und sonstige Daten, die über eine Website generiert werden, handeln.
                        </p>
                        <p className="mt-2">
                            Das externe Hosting erfolgt zum Zwecke der Vertragserfüllung gegenüber unseren potenziellen und
                            bestehenden Kunden (Art. 6 Abs. 1 lit. b DSGVO) und im Interesse einer sicheren, schnellen und
                            effizienten Bereitstellung unseres Online-Angebots durch einen professionellen Anbieter (Art. 6 Abs. 1 lit. f DSGVO).
                        </p>
                        <p className="mt-2">
                            Unser Hoster wird Ihre Daten nur insoweit verarbeiten, wie dies zur Erfüllung seiner Leistungspflichten
                            erforderlich ist und unsere Weisungen in Bezug auf diese Daten befolgen.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Allgemeine Hinweise und Pflichtinformationen</h2>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Datenschutz</h3>
                        <p>
                            Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre
                            personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie
                            dieser Datenschutzerklärung.
                        </p>
                        <p className="mt-2">
                            Wenn Sie diese Website benutzen, werden verschiedene personenbezogene Daten erhoben. Personenbezogene
                            Daten sind Daten, mit denen Sie persönlich identifiziert werden können. Die vorliegende Datenschutzerklärung
                            erläutert, welche Daten wir erheben und wofür wir sie nutzen. Sie erläutert auch, wie und zu welchem Zweck
                            das geschieht.
                        </p>
                        <p className="mt-2">
                            Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation per E-Mail)
                            Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist
                            nicht möglich.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Hinweis zur verantwortlichen Stelle</h3>
                        <p>
                            Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
                        </p>
                        <p className="mt-2">
                            MD IT Solutions<br />
                            An der Hohl 4<br />
                            36318 Schwalmtal<br />
                            Deutschland
                        </p>
                        <p className="mt-2">
                            Telefon: <a href="tel:+4966387292101" className="text-indigo-600 hover:underline">+49 6638 7292101</a><br />
                            E-Mail: <a href="mailto:info@md-it-solutions.de" className="text-indigo-600 hover:underline">info@md-it-solutions.de</a>
                        </p>
                        <p className="mt-2">
                            Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen
                            über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z.B. Namen, E-Mail-Adressen o. Ä.) entscheidet.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Speicherdauer</h3>
                        <p>
                            Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben
                            Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt. Wenn Sie ein
                            berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur Datenverarbeitung widerrufen,
                            werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung
                            Ihrer personenbezogenen Daten haben (z.B. steuer- oder handelsrechtliche Aufbewahrungsfristen); im
                            letztgenannten Fall erfolgt die Löschung nach Fortfall dieser Gründe.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
                        <p>
                            Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können eine
                            bereits erteilte Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit der bis zum Widerruf erfolgten
                            Datenverarbeitung bleibt vom Widerruf unberührt.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Beschwerderecht bei der zuständigen Aufsichtsbehörde</h3>
                        <p>
                            Im Falle von Verstößen gegen die DSGVO steht den Betroffenen ein Beschwerderecht bei einer Aufsichtsbehörde,
                            insbesondere in dem Mitgliedstaat ihres gewöhnlichen Aufenthalts, ihres Arbeitsplatzes oder des Orts des
                            mutmaßlichen Verstoßes zu. Das Beschwerderecht besteht unbeschadet anderweitiger verwaltungsrechtlicher
                            oder gerichtlicher Rechtsbehelfe.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Recht auf Datenübertragbarkeit</h3>
                        <p>
                            Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erfüllung eines Vertrags
                            automatisiert verarbeiten, an sich oder an einen Dritten in einem gängigen, maschinenlesbaren Format
                            aushändigen zu lassen. Sofern Sie die direkte Übertragung der Daten an einen anderen Verantwortlichen
                            verlangen, erfolgt dies nur, soweit es technisch machbar ist.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Auskunft, Löschung und Berichtigung</h3>
                        <p>
                            Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche
                            Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck
                            der Datenverarbeitung und ggf. ein Recht auf Berichtigung oder Löschung dieser Daten. Hierzu sowie zu
                            weiteren Fragen zum Thema personenbezogene Daten können Sie sich jederzeit an uns wenden.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Recht auf Einschränkung der Verarbeitung</h3>
                        <p>
                            Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen.
                            Hierzu können Sie sich jederzeit an uns wenden. Das Recht auf Einschränkung der Verarbeitung besteht
                            in folgenden Fällen:
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Wenn Sie die Richtigkeit Ihrer bei uns gespeicherten personenbezogenen Daten bestreiten</li>
                            <li>Wenn die Verarbeitung Ihrer personenbezogenen Daten unrechtmäßig geschah/geschieht</li>
                            <li>Wenn wir Ihre personenbezogenen Daten nicht mehr benötigen</li>
                            <li>Wenn Sie Widerspruch gegen die Verarbeitung eingelegt haben</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Datenerfassung auf dieser Website</h2>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Server-Log-Dateien</h3>
                        <p>
                            Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien,
                            die Ihr Browser automatisch an uns übermittelt. Dies sind:
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Browsertyp und Browserversion</li>
                            <li>verwendetes Betriebssystem</li>
                            <li>Referrer URL</li>
                            <li>Hostname des zugreifenden Rechners</li>
                            <li>Uhrzeit der Serveranfrage</li>
                            <li>IP-Adresse</li>
                        </ul>
                        <p className="mt-2">
                            Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die Erfassung dieser
                            Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Der Websitebetreiber hat ein berechtigtes
                            Interesse an der technisch fehlerfreien Darstellung und der Optimierung seiner Website – hierzu müssen
                            die Server-Log-Files erfasst werden.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Registrierung auf dieser Website</h3>
                        <p>
                            Sie können sich auf dieser Website registrieren, um zusätzliche Funktionen auf der Seite zu nutzen.
                            Die dazu eingegebenen Daten verwenden wir nur zum Zwecke der Nutzung des jeweiligen Angebotes oder
                            Dienstes, für den Sie sich registriert haben. Die bei der Registrierung abgefragten Pflichtangaben
                            müssen vollständig angegeben werden. Anderenfalls werden wir die Registrierung ablehnen.
                        </p>
                        <p className="mt-2">
                            Für wichtige Änderungen etwa beim Angebotsumfang oder bei technisch notwendigen Änderungen nutzen wir
                            die bei der Registrierung angegebene E-Mail-Adresse, um Sie auf diesem Wege zu informieren.
                        </p>
                        <p className="mt-2">
                            Die Verarbeitung der bei der Registrierung eingegebenen Daten erfolgt zum Zwecke der Durchführung des
                            durch die Registrierung begründeten Nutzungsverhältnisses und ggf. zur Anbahnung weiterer Verträge
                            (Art. 6 Abs. 1 lit. b DSGVO).
                        </p>
                        <p className="mt-2">
                            Die bei der Registrierung erfassten Daten werden von uns gespeichert, solange Sie auf dieser Website
                            registriert sind und werden anschließend gelöscht. Gesetzliche Aufbewahrungsfristen bleiben unberührt.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Zahlungsanbieter</h2>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Stripe</h3>
                        <p>
                            Wir bieten die Möglichkeit, den Zahlungsvorgang über den Zahlungsdienstleister Stripe abzuwickeln.
                            Anbieter ist die Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland.
                        </p>
                        <p className="mt-2">
                            Wenn Sie sich für die Zahlung mit Stripe entscheiden, werden die von Ihnen eingegebenen Zahlungsdaten
                            an Stripe übermittelt. Die Übermittlung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)
                            und Art. 6 Abs. 1 lit. b DSGVO (Verarbeitung zur Erfüllung eines Vertrags).
                        </p>
                        <p className="mt-2">
                            Details entnehmen Sie der Datenschutzerklärung von Stripe unter:
                            <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline ml-1">
                                https://stripe.com/de/privacy
                            </a>
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

export default Datenschutz;

import showdown from "showdown";
import xss from "xss";

export function pageTitle(title: string, opts = { prefix: true }) {
  return opts.prefix ? `${title} | Vauntly.com` : title;
}

const converter = new showdown.Converter({ simpleLineBreaks: true });

export function convertTextToHtml(text: string | null | undefined): string {
  const textToClean = text || "";
  return xss(converter.makeHtml(cleanText(textToClean)));
}

export function cleanText(text: string) {
  return text
    .replaceAll("â€ ", "&rsquo;")
    .replaceAll("Â", "")
    .replaceAll("• *", "  *")
    .replaceAll("•", "*")
    .replaceAll("●", "*");
}

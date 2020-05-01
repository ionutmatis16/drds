export function getQueryParamValue(url, queryParam) {
    let questionMark = url.indexOf("?");
    let params = url.substring(questionMark + 1).split("&");

    for (let i = 0; i < params.length; i++) {
        let paramSplit = params[i].split("=");
        if (paramSplit[0] === queryParam) {
            return paramSplit[1];
        }
    }

    return '';
}
function main() {
    var report = AdWordsApp.report(
        'SELECT Url, Domain, Clicks, Impressions, Cost ' +
        'FROM   URL_PERFORMANCE_REPORT ' +
        'WHERE  Impressions > 0 ' +
        'DURING LAST_7_DAYS');

    var rows = report.rows();
    while (rows.hasNext()) {
        var row = rows.next();
        var url = row['Url'];
        var domain = row['Domain']
        Logger.log(url + ' - ' + domain);
    }
}
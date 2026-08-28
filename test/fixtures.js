export const ARTICLE_HTML = `<!DOCTYPE html>
<html lang="tr"><head><title>Test</title></head><body>
  <nav id="mw-panel">
    <a id="sidebar-link" href="/wiki/Anasayfa">Anasayfa</a>
  </nav>
  <div id="mw-content-text">
    <p>
      <a id="body-link" href="/wiki/Ankara">Ankara</a>
      <a id="styled-link" href="/wiki/İzmir" style="color: rgb(255, 0, 0);">İzmir</a>
      <a id="external-link" href="https://example.com/x">dış bağlantı</a>
      <a id="anchor-link" href="#kaynakca">bölüme git</a>
      <sup id="ref" class="reference"><a id="ref-link" href="/wiki/Kaynak">[1]</a></sup>
      <sup id="plain-sup"><a id="sup-link" href="/wiki/Not">not</a></sup>
      <span class="mw-editsection"><a id="edit-link" href="/wiki/Duzenle">düzenle</a></span>
    </p>
    <table class="infobox"><tr><td>
      <a id="infobox-link" href="/wiki/Turkiye">Türkiye</a>
    </td></tr></table>
    <table class="navbox"><tr><td>
      <a id="table-link" href="/wiki/Sehirler">Şehirler</a>
    </td></tr></table>
    <div id="lazy"></div>
  </div>
</body></html>`;

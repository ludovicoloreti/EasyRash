<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns:x ="http://www.w3.org/1999/xhtml">

<xsl:template match="/html">
    <div class="annotations">
          <xsl:apply-templates select="@*|node()"/>
    </div>
</xsl:template>

<xsl:template match="/html/head">
  <div class="jsonld"><xsl:copy-of select="script[type='application/ld+json']"/></div>
</xsl:template>

</xsl:stylesheet>

<!--  -->

<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="@*|node()">
  <xsl:copy>
    <xsl:apply-templates select="@*|node()"/>
  </xsl:copy>
</xsl:template>

<xsl:template match="/">
  <xsl:apply-templates select="html/head"/>
</xsl:template>

</xsl:stylesheet>

<!--  -->

<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns="http://www.w3.org/HTML4/">


<xsl:template match="head">
  <div class="annotation">
    <div class="jsonld"><xsl:value-of select="script"/></div>
  </div>
</xsl:template>


</xsl:stylesheet>

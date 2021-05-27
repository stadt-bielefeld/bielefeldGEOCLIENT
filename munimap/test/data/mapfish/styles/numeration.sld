<?xml version="1.0" encoding="UTF8"?>
<StyledLayerDescriptor version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<NamedLayer>
  <Name>numeration</Name>
    <UserStyle>
      <Title>Numeration</Title>
      <FeatureTypeStyle>
        <Rule>
          <TextSymbolizer>
            <Label>
              <ogc:PropertyName>%(label)s</ogc:PropertyName>
            </Label>
            <LabelPlacement>
              <PointPlacement>
                <!-- position of text baseline, 0.5, 0.5 is center baseline on label point -->
                <AnchorPoint>
                  <AnchorPointX>0.5</AnchorPointX>
                  <AnchorPointY>0.8</AnchorPointY>
                </AnchorPoint>
                <Displacement>
                  <DisplacementX>%(labelXOffset)s</DisplacementX>
                  <DisplacementY>%(labelYOffset)s</DisplacementY>
                </Displacement>
              </PointPlacement>
            </LabelPlacement>
            <Font>
              <CssParameter name="font-family">%(fontFamily)s</CssParameter>
              <!-- fontSize = fontSize - (fontSize / 10 * (strLen - 1)) -->
              <CssParameter name="font-size">
                <Sub>
                  <Literal>%(fontSize)s</Literal>
                  <Mul>
                    <Div>
                      <Literal>%(fontSize)s</Literal>
                      <Literal>10</Literal>
                    </Div>
                    <Sub>
                      <ogc:Function name="strLength">
                        <ogc:PropertyName>%(label)s</ogc:PropertyName>
                      </ogc:Function>
                      <Literal>1</Literal>
                    </Sub>
                  </Mul>
                </Sub>
              </CssParameter>
            </Font>
            <Fill>
              <CssParameter name="fill">%(fontColor)s</CssParameter>
            </Fill>
            <VendorOption name="spaceAround">-1</VendorOption>
          </TextSymbolizer>
          <TextSymbolizer>
            <Label>
              <ogc:PropertyName>%(label)s</ogc:PropertyName>
            </Label>
            <LabelPlacement>
              <PointPlacement>
                <!-- position of text baseline, 0.5, 0.5 is center baseline on label point -->
                <AnchorPoint>
                  <AnchorPointX>0.5</AnchorPointX>
                  <AnchorPointY>0.8</AnchorPointY>
                </AnchorPoint>
                <Displacement>
                  <DisplacementX>
                    <Add>
                      <Literal>%(labelXOffset)s</Literal>
                      <Literal>%(circleXOffset)s</Literal>
                    </Add>
                  </DisplacementX>
                  <DisplacementY>
                    <Add>
                      <Literal>%(labelYOffset)s</Literal>
                      <Literal>%(circleYOffset)s</Literal>
                    </Add>
                  </DisplacementY>
                </Displacement>
              </PointPlacement>
            </LabelPlacement>
            <Font>
              <CssParameter name="font-family">%(fontFamily)s</CssParameter>
              <!-- fontSize = fontSize - (fontSize / 10 * (strLen - 1)) -->
              <CssParameter name="font-size">
                <Sub>
                  <Literal>%(fontSize)s</Literal>
                  <Mul>
                    <Div>
                      <Literal>%(fontSize)s</Literal>
                      <Literal>10</Literal>
                    </Div>
                    <Sub>
                      <ogc:Function name="strLength">
                        <ogc:PropertyName>%(label)s</ogc:PropertyName>
                      </ogc:Function>
                      <Literal>1</Literal>
                    </Sub>
                  </Mul>
                </Sub>
              </CssParameter>
            </Font>
            <Fill>
              <CssParameter name="fill">%(fillColor)s</CssParameter>
            </Fill>
            <Graphic>
              <Mark>
                <WellKnownName>circle</WellKnownName>
                <Fill>
                  <CssParameter name="fill">%(fillColor)s</CssParameter>
                </Fill>
              </Mark>
            </Graphic>
            <VendorOption name="graphic-resize">proportional</VendorOption>
            <VendorOption name="graphic-margin">%(circleMargin)s</VendorOption>
            <VendorOption name="spaceAround">-1</VendorOption>
          </TextSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
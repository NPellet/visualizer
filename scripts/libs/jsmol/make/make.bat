@echo off

echo NOTE THAT THESE MUST BE LISTED IN package.js AS WELL

mkdir ..\j2s\img
del ..\j2s\img\*.jpg
copy img\* ..\j2s\img\

mkdir ..\j2s\core
del ..\j2s\core\*.js
copy package.js ..\j2s\core
del core.js

echo corescript
call loadScript J\viewer\ScriptManager.js
call loadScript J\api\JmolScriptManager.js -- required by org.jmol.viewer.ScriptManager
call loadScript J\thread\CommandWatcherThread.js
call loadScript J\thread\ScriptQueueThread.js
call loadScript J\script\ScriptEvaluator.js
call loadScript J\api\JmolScriptEvaluator.js -- required by org.jmol.script.ScriptEvaluator
call loadScript J\script\ScriptCompiler.js
call loadScript J\script\ScriptCompilationTokenParser.js -- required by org.jmol.script.ScriptCompiler
call loadScript J\script\ScriptFlowContext.js
call loadScript J\script\ScriptFunction.js
call loadScript J\api\JmolScriptFunction.js -- required by org.jmol.script.ScriptFunction
call loadScript J\script\ScriptInterruption.js
call loadScript J\script\ScriptMathProcessor.js
call loadScript java\util\regex\Pattern.js
call loadScript java\util\regex\Matcher.js
call loadScript java\util\regex\MatchResult.js -- required by java.util.regex.Matcher
call setCore corescript

echo corestate
call loadScript J\api\JmolStateCreator.js
call loadScript J\viewer\StateCreator.js
call setCore corestate

echo coreprop
call loadScript J\api\JmolPropertyManager.js
call loadScript J\viewer\PropertyManager.js
call setCore coreprop

echo coreconsole
type coreconsoletop.js >> core.js
call loadScript J\api\JmolAppConsoleInterface.js -- required by org.jmol.console.GenericConsole
call loadScript J\console\GenericTextArea.js -- required by org.jmol.consolejs.GenericConsole
call loadScript J\console\GenericConsole.js -- required by org.jmol.consolejs.AppletConsole
call loadScript J\consolejs\AppletConsole.js
call setCore coreconsole

echo coremenu
type coremenutop.js >> core.js
call loadScript J\api\JmolPopupInterface.js -- required by org.jmol.awtjs2d.JSmolPopup
call loadScript J\popup\JmolAbstractMenu.js -- required by org.jmol.popup.GenericPopup
call loadScript J\popup\GenericPopup.js
call loadScript J\awtjs2d\JSPopup.js -- required by org.jmol.awtjs2d.JSmolPopup
call loadScript J\awtjs2d\JSmolPopup.js
call loadScript J\popup\PopupResource.js -- required by org.jmol.popup.MainPopupResourceBundle
call loadScript J\popup\MainPopupResourceBundle.js
call setCore coremenu

echo coremin
call loadScript J\api\MinimizerInterface.js -- required by J.minimize.Minimizer
call loadScript J\minimize\Minimizer.js
call loadScript J\minimize\MinObject.js -- required by J.minimize.MinAngle
call loadScript J\minimize\MinAngle.js
call loadScript J\minimize\MinAtom.js
call loadScript J\minimize\MinBond.js
call loadScript J\minimize\MinTorsion.js
call loadScript J\minimize\Util.js
call loadScript J\minimize\forcefield\AtomType.js
call loadScript J\minimize\forcefield\ForceField.js -- required by J.minimize.forcefield.ForceFieldMMFF
call loadScript J\minimize\forcefield\ForceFieldMMFF.js
call loadScript J\minimize\forcefield\ForceFieldUFF.js
call loadScript J\minimize\forcefield\Calculation.js -- required by J.minimize.forcefield.CalculationsMMFF
call loadScript J\minimize\forcefield\Calculations.js -- required by J.minimize.forcefield.CalculationsMMFF
call loadScript J\minimize\forcefield\CalculationsMMFF.js
call loadScript J\minimize\forcefield\CalculationsUFF.js
call loadScript J\minimize\forcefield\FFParam.js
call loadScript J\thread\MinimizationThread.js
call setCore coremin

echo corezip
call loadScript J\api\JmolZipUtility.js -- required by org.jmol.io2.ZipUtil
call loadScript J\io2\ZipUtil.js
call loadScript java\io\ByteArrayOutputStream.js
call loadScript java\io\FileInputStream.js
call loadScript JZ\Checksum.js -- required by com.jcraft.jzlib.CRC32
call loadScript JZ\CRC32.js -- required by java.util.zip.CRC32
call loadScript java\util\zip\CRC32.js
call loadScript JZ\InflaterInputStream.js -- required by java.util.zip.InflaterInputStream
call loadScript java\util\zip\InflaterInputStream.js -- required by java.util.zip.GZIPInputStream
call loadScript java\util\zip\GZIPInputStream.js
call loadScript JZ\ZStream.js -- required by com.jcraft.jzlib.Inflater
call loadScript JZ\Inflater.js
call loadScript JZ\Adler32.js
call loadScript JZ\Tree.js -- required by com.jcraft.jzlib.Deflate
call loadScript JZ\StaticTree.js
call loadScript JZ\Deflate.js
call loadScript JZ\Deflater.js
call loadScript JZ\GZIPHeader.js
call loadScript JZ\Inflate.js
call loadScript JZ\InfTree.js -- required by com.jcraft.jzlib.InfBlocks
call loadScript JZ\InfBlocks.js
call loadScript JZ\InfCodes.js
call loadScript java\util\zip\CheckedInputStream.js
call loadScript java\util\zip\Inflater.js
call loadScript java\util\zip\ZipException.js
call loadScript java\util\zip\ZipConstants.js -- required by java.util.zip.ZipEntry
call loadScript java\util\zip\ZipEntry.js
call loadScript java\util\zip\ZipConstants64.js -- required by java.util.zip.ZipInputStream
call loadScript java\util\zip\ZipInputStream.js
call loadScript java\io\PushbackInputStream.js
call loadScript J\api\ZInputStream.js -- required by org.jmol.io2.JmolZipInputStream
call loadScript J\io2\JmolZipInputStream.js
call loadScript JZ\DeflaterOutputStream.js -- required by java.util.zip.DeflaterOutputStream
call loadScript java\util\zip\Deflater.js
call loadScript java\util\zip\DeflaterOutputStream.js
call loadScript java\util\zip\ZipOutputStream.js
call loadScript J\io2\JpegEncoder.js
call loadScript J\export\image\GenericCRCEncoder.js -- required by org.jmol.export.image.GenericPngEncoder
call loadScript J\export\image\GenericPngEncoder.js
call loadScript J\api\JmolImageCreatorInterface.js -- required by org.jmol.export.image.GenericImageCreator
call loadScript J\export\image\GenericImageCreator.js -- required by org.jmol.exportjs.JSImageCreator
call loadScript J\exportjs\JSImageCreator.js
call setCore corezip

echo corebio
call loadScript J\adapter\readers\cifpdb\PdbReader.js
call loadScript J\adapter\smarter\Structure.js
call loadScript J\api\JmolBioResolver.js -- required by org.jmol.modelsetbio.Resolver
call loadScript J\modelsetbio\Resolver.js
call loadScript J\modelsetbio\Monomer.js -- required by org.jmol.modelsetbio.AlphaMonomer
call loadScript J\modelsetbio\AlphaMonomer.js
call loadScript J\modelsetbio\ProteinStructure.js -- required by org.jmol.modelsetbio.Helix
call loadScript J\modelsetbio\Helix.js
call loadScript J\modelsetbio\Sheet.js
call loadScript J\modelsetbio\Turn.js
call loadScript J\modelsetbio\BioPolymer.js -- required by org.jmol.modelsetbio.AlphaPolymer
call loadScript J\modelsetbio\AlphaPolymer.js
call loadScript J\modelsetbio\AminoMonomer.js
call loadScript J\modelsetbio\AminoPolymer.js
call loadScript J\modelsetbio\APBridge.js
call loadScript J\modelsetbio\BioModel.js
call loadScript J\modelsetbio\CarbohydrateMonomer.js
call loadScript J\modelsetbio\CarbohydratePolymer.js
call loadScript J\modelsetbio\PhosphorusMonomer.js -- required by org.jmol.modelsetbio.NucleicMonomer
call loadScript J\modelsetbio\NucleicMonomer.js
call loadScript J\modelsetbio\NucleicPolymer.js
call loadScript J\modelsetbio\PhosphorusPolymer.js
call loadScript J\shapebio\BioShape.js
call loadScript J\shapebio\BioShapeCollection.js -- required by org.jmol.shapebio.Rockets
call loadScript J\shapebio\Rockets.js -- required by org.jmol.shapebio.Cartoon
call loadScript J\shapebio\Cartoon.js
call loadScript J\shapebio\Backbone.js
call loadScript J\shapebio\Trace.js
call loadScript J\renderbio\BioShapeRenderer.js -- required by org.jmol.renderbio.RocketsRenderer
call loadScript J\renderbio\RocketsRenderer.js -- required by org.jmol.renderbio.CartoonRenderer
call loadScript J\renderbio\CartoonRenderer.js
call loadScript J\renderbio\BackboneRenderer.js
call loadScript J\renderbio\TraceRenderer.js
call setCore corebio

echo coresurface
call loadScript J\jvxl\api\VertexDataServer.js -- required by org.jmol.jvxl.api.MeshDataServer
call loadScript J\jvxl\api\MeshDataServer.js -- required by org.jmol.shapesurface.Isosurface
call loadScript J\shapesurface\Isosurface.js
call loadScript J\jvxl\data\JvxlCoder.js
call loadScript J\api\VolumeDataInterface.js -- required by org.jmol.jvxl.data.VolumeData
call loadScript J\jvxl\data\VolumeData.js
call loadScript J\jvxl\data\JvxlData.js
call loadScript J\jvxl\data\MeshData.js
call loadScript J\jvxl\readers\SurfaceGenerator.js
call loadScript J\jvxl\readers\Parameters.js
call loadScript J\jvxl\readers\SurfaceReader.js
call loadScript J\jvxl\calc\MarchingCubes.js
call loadScript J\jvxl\calc\MarchingSquares.js
call loadScript J\shapesurface\IsosurfaceMesh.js
call loadScript J\jvxl\readers\VolumeDataReader.js -- required by org.jmol.jvxl.readers.AtomDataReader
call loadScript J\jvxl\readers\AtomDataReader.js -- required by org.jmol.jvxl.readers.IsoSolventReader
call loadScript J\jvxl\readers\IsoSolventReader.js
call loadScript J\rendersurface\IsosurfaceRenderer.js
call setCore coresurface

echo coresym
call loadScript J\api\SymmetryInterface.js -- required by org.jmol.symmetry.Symmetry
call loadScript J\symmetry\Symmetry.js
call loadScript J\symmetry\PointGroup.js
call loadScript J\symmetry\SpaceGroup.js
call loadScript J\symmetry\HallInfo.js
call loadScript J\symmetry\HallRotation.js
call loadScript J\symmetry\HallTranslation.js
call loadScript J\symmetry\SymmetryOperation.js
call loadScript J\symmetry\SymmetryInfo.js
call loadScript J\symmetry\UnitCell.js
call setCore coresym

echo coresmiles
call loadScript J\api\SmilesMatcherInterface.js -- required by org.jmol.smiles.SmilesMatcher
call loadScript J\smiles\SmilesMatcher.js
call loadScript J\smiles\InvalidSmilesException.js
call loadScript J\smiles\SmilesSearch.js -- required by org.jmol.smiles.SmilesGenerator
call loadScript J\smiles\SmilesGenerator.js
call loadScript J\smiles\SmilesAromatic.js
call loadScript J\smiles\SmilesAtom.js
call loadScript J\smiles\SmilesBond.js
call loadScript J\smiles\SmilesMeasure.js
call loadScript J\smiles\SmilesParser.js
call setCore coresmiles

call makecore.bat

@echo on

type ..\j2s\J\Jmol.properties

call min.bat

:EXIT


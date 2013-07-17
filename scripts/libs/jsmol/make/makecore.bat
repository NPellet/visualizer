echo core.js
type ..\j2s\J\Jmol.properties > core.js
type coretop.js >> core.js
call loadScript java\net\MalformedURLException.js
call loadScript java\net\URLEncoder.js
call loadScript java\net\URLDecoder.js
call loadScript java\net\URLStreamHandlerFactory.js
call loadScript java\net\URLStreamHandler.js
call loadScript java\net\Parts.js
call loadScript java\net\URL.js
call loadScript java\net\URLConnection.js
call loadScript J\awtjs2d\JmolURLConnection.js


call loadScript java\util\MapEntry.js ------- java.util.Hashtable
call loadScript java\util\Dictionary.js ------- java.util.Hashtable
call loadScript java\util\Hashtable.js ------- java.net.URL


call loadScript J\util\LoggerInterface.js ------- org.jmol.util.DefaultLogger
call loadScript J\util\DefaultLogger.js ------- org.jmol.util.Logger
call loadScript J\util\Logger.js
call loadScript J\i18n\Resource.js
call loadScript J\i18n\Language.js
call loadScript java\text\MessageFormat.js
call loadScript J\i18n\GT.js



call loadScript java\lang\AbstractStringBuilder.js ------- java.lang.StringBuffer
call loadScript java\lang\StringBuffer.js
call loadScript java\lang\StringBuilder.js
call loadScript java\util\AbstractCollection.js
call loadScript java\util\AbstractList.js ------- java.util.ArrayList
call loadScript java\util\ArrayList.js
call loadScript java\util\AbstractSet.js
call loadScript java\util\Arrays.js
call loadScript java\util\AbstractMap.js ------- java.util.Collections
call loadScript java\util\SortedMap.js ------- java.util.Collections
call loadScript java\util\SortedSet.js ------- java.util.Collections
call loadScript java\util\Collections.js
call loadScript java\util\Random.js
call loadScript J\util\JmolList.js
call loadScript J\awtjs2d\JmolURLConnection.js
call loadScript J\api\JmolCallbackListener.js ------- org.jmol.api.JmolStatusListener
call loadScript J\api\JmolStatusListener.js ------- org.jmol.appletjs.Jmol
call loadScript J\api\JmolSyncInterface.js ------- org.jmol.appletjs.Jmol
call loadScript J\appletjs\Jmol.js
call loadScript J\appletjs\JmolAppletRegistry.js
call loadScript java\lang\Enum.js ------- org.jmol.constant.EnumCallback
call loadScript J\constant\EnumCallback.js
call loadScript J\util\Escape.js
call loadScript J\util\Parser.js
call loadScript J\util\TextFormat.js
call loadScript J\util\SB.js
call loadScript J\script\T.js ------- org.jmol.script.SV
call loadScript J\util\Tuple3d.js -- required by J.util.Vector3d
call loadScript J\util\Vector3d.js
call loadScript J\util\P3.js ------- org.jmol.script.SV
call loadScript J\script\SV.js
call loadScript J\util\ArrayUtil.js
call loadScript J\util\BS.js ------- org.jmol.util.BSUtil
call loadScript J\util\BSUtil.js
call loadScript J\util\Matrix3f.js
call loadScript J\util\Matrix4f.js
call loadScript J\util\JmolEdge.js ------- org.jmol.modelset.Bond
call loadScript J\modelset\Bond.js
call loadScript J\util\Measure.js
call loadScript J\util\Tuple3f.js
call loadScript J\util\Tuple4f.js ------- org.jmol.util.P4
call loadScript J\util\P4.js
call loadScript J\io\Encoding.js
call loadScript java\io\FilterInputStream.js ------- java.io.BufferedInputStream
call loadScript java\io\BufferedInputStream.js ------- org.jmol.viewer.JC
call loadScript java\util\Properties.js ------- org.jmol.viewer.JC
call loadScript J\util\Elements.js ------- org.jmol.viewer.JC
call loadScript J\util\V3.js ------- org.jmol.viewer.JC
call loadScript J\viewer\JC.js
call loadScript J\util\Int2IntHash.js ------- org.jmol.util.C
call loadScript J\util\C.js
call loadScript J\util\Eigen.js
call loadScript J\util\Quaternion.js
call loadScript J\constant\EnumPalette.js
call loadScript J\util\ColorUtil.js
call loadScript J\util\Shader.js
call loadScript J\util\Quadric.js
call loadScript J\util\AxisAngle4f.js
call loadScript J\api\JmolViewer.js ------- org.jmol.viewer.Viewer
call loadScript J\atomdata\AtomDataServer.js ------- org.jmol.viewer.Viewer
call loadScript J\constant\EnumVdw.js ------- org.jmol.atomdata.RadiusData
call loadScript J\atomdata\RadiusData.js ------- org.jmol.viewer.Viewer
call loadScript J\util\CommandHistory.js ------- org.jmol.viewer.Viewer
call loadScript J\util\Dimension.js ------- org.jmol.viewer.Viewer
call loadScript J\viewer\Viewer.js
call loadScript java\io\InputStream.js ------- java.io.FilterInputStream
call loadScript java\io\OutputStream.js ------- java.io.FilterOutputStream
call loadScript java\io\FilterOutputStream.js ------- java.io.BufferedOutputStream
call loadScript java\io\BufferedOutputStream.js
call loadScript java\io\Reader.js ------- java.io.BufferedReader
call loadScript java\io\BufferedReader.js
call loadScript java\io\Writer.js ------- java.io.BufferedWriter
call loadScript java\io\BufferedWriter.js
call loadScript java\io\StringReader.js
call loadScript java\lang\Thread.js
call loadScript J\constant\EnumQuantumShell.js ------- org.jmol.api.JmolAdapter
call loadScript J\api\JmolAdapter.js ------- org.jmol.adapter.smarter.SmarterJmolAdapter
call loadScript J\adapter\smarter\SmarterJmolAdapter.js
call loadScript J\api\Interface.js
call loadScript java\lang\ThreadGroup.js
call loadScript J\constant\EnumAxesMode.js
call loadScript J\constant\EnumFileStatus.js
call loadScript J\api\JmolAdapterAtomIterator.js ------- org.jmol.adapter.smarter.AtomIterator
call loadScript J\adapter\smarter\AtomIterator.js
call loadScript J\adapter\smarter\AtomSetCollection.js
call loadScript J\api\JmolAdapterBondIterator.js ------- org.jmol.adapter.smarter.BondIterator
call loadScript J\adapter\smarter\BondIterator.js
call loadScript J\adapter\smarter\Resolver.js
call loadScript J\api\JmolAdapterStructureIterator.js ------- org.jmol.adapter.smarter.StructureIterator
call loadScript J\adapter\smarter\StructureIterator.js
call loadScript J\modelset\Group.js
call loadScript J\adapter\smarter\Atom.js
call loadScript J\adapter\smarter\AtomSetObject.js ------- org.jmol.adapter.smarter.Bond
call loadScript J\adapter\smarter\Bond.js
call loadScript J\util\Tuple3i.js ------- org.jmol.util.P3i
call loadScript J\util\P3i.js
call loadScript J\constant\EnumStructure.js
call loadScript java\util\StringTokenizer.js
call loadScript J\adapter\smarter\AtomSetCollectionReader.js
call loadScript J\thread\JmolThread.js ------- org.jmol.thread.ScriptDelayThread
call loadScript J\thread\ScriptDelayThread.js
call loadScript J\io\LimitedLineReader.js
call loadScript J\constant\EnumStereoMode.js
call loadScript J\io\Base64.js
call loadScript J\io\CifDataReader.js
call loadScript J\io\JmolBinary.js
call loadScript J\io\OutputStringBuilder.js
call loadScript J\shape\Shape.js
call loadScript java\io\ByteArrayInputStream.js
call loadScript java\io\InputStreamReader.js
call loadScript J\viewer\FileManager.js
call loadScript J\script\ContextToken.js
call loadScript J\script\ScriptContext.js
call loadScript J\constant\EnumAnimationMode.js
call loadScript J\io\FileReader.js
call loadScript J\viewer\DataManager.js
call loadScript J\util\JmolNode.js ------- org.jmol.modelset.Atom
call loadScript J\util\Point3fi.js ------- org.jmol.modelset.Atom
call loadScript J\modelset\Atom.js
call loadScript J\modelset\AtomCollection.js
call loadScript J\modelset\LabelToken.js
call loadScript J\api\JmolMeasurementClient.js ------- org.jmol.modelset.MeasurementData
call loadScript J\modelset\MeasurementData.js
call loadScript J\util\BoxInfo.js ------- org.jmol.modelset.ModelCollection
call loadScript J\modelset\BondCollection.js ------- org.jmol.modelset.ModelCollection
call loadScript J\modelset\ModelCollection.js
call loadScript J\atomdata\AtomData.js ------- org.jmol.geodesic.EnvelopeCalculation
call loadScript J\geodesic\EnvelopeCalculation.js
call loadScript J\modelset\Measurement.js
call loadScript J\util\Geodesic.js
call loadScript J\util\Normix.js
call loadScript J\modelset\BondIterator.js ------- org.jmol.modelset.BondIteratorSelected
call loadScript J\modelset\BondIteratorSelected.js
call loadScript J\modelset\HBond.js
call loadScript J\util\TriangleData.js
call loadScript J\bspt\Bspf.js
call loadScript J\io\XmlUtil.js
call loadScript J\api\AtomIndexIterator.js ------- org.jmol.modelset.AtomIteratorWithinModel
call loadScript J\modelset\AtomIteratorWithinModel.js
call loadScript J\modelset\AtomIteratorWithinModelSet.js
call loadScript J\bspt\Bspt.js
call loadScript J\util\JmolMolecule.js
call loadScript J\modelset\TickInfo.js
call loadScript J\script\ScriptException.js
call loadScript J\bspt\CubeIterator.js
call loadScript J\bspt\Element.js ------- org.jmol.bspt.Leaf
call loadScript J\bspt\Leaf.js
call loadScript J\shape\Object2d.js
call loadScript J\util\ColorEncoder.js
call loadScript J\api\JmolGraphicsInterface.js ------- org.jmol.util.GData
call loadScript J\util\GData.js
call loadScript J\bspt\Node.js
call loadScript J\util\JmolFont.js
call loadScript J\util\MeshSurface.js
call loadScript J\util\Rectangle.js ------- org.jmol.viewer.ActionManager
call loadScript J\viewer\MouseState.js ------- org.jmol.viewer.ActionManager
call loadScript J\viewer\ActionManager.js
call loadScript J\viewer\StateManager.js
call loadScript J\modelset\MeasurementPending.js
call loadScript J\thread\HoverWatcherThread.js
call loadScript J\viewer\binding\Binding.js
call loadScript J\viewer\binding\DragBinding.js
call loadScript J\viewer\binding\JmolBinding.js
call loadScript J\thread\TimeoutThread.js
call loadScript J\util\TempArray.js
call loadScript J\viewer\AnimationManager.js
call loadScript J\viewer\ColorManager.js
call loadScript J\viewer\ShapeManager.js
call loadScript J\thread\AnimationThread.js
call loadScript J\viewer\ModelManager.js
call loadScript J\viewer\SelectionManager.js
call loadScript J\viewer\StatusManager.js
call loadScript J\viewer\TransformManager.js ------- org.jmol.viewer.TransformManager10
call loadScript J\modelset\ModelSettings.js
call loadScript J\modelset\ModelLoader.js
call loadScript J\viewer\TransformManager11.js
call loadScript J\modelset\Chain.js
call loadScript J\modelset\Model.js
call loadScript J\modelset\ModelSet.js
call loadScript J\util\Hermite.js
call loadScript J\thread\MoveThread.js
call loadScript J\thread\MoveToThread.js
call loadScript J\thread\SpinThread.js
call loadScript J\thread\VibrationThread.js
call loadScript J\api\ApiPlatform.js ------- org.jmol.awtjs2d.Platform
call loadScript J\awtjs2d\Platform.js
call loadScript J\awtjs2d\AjaxURLStreamHandlerFactory.js
call loadScript J\awtjs2d\AjaxURLStreamHandler.js
call loadScript J\awtjs2d\Display.js
call loadScript J\awtjs2d\Font.js
call loadScript J\awtjs2d\Image.js
call loadScript J\api\JmolFileInterface.js ------- org.jmol.awtjs2d.JmolFile
call loadScript J\awtjs2d\JmolFile.js
call loadScript J\api\JmolFileAdapterInterface.js ------- org.jmol.awtjs2d.JmolFileAdapter
call loadScript J\awtjs2d\JmolFileAdapter.js
call loadScript J\api\JmolMouseInterface.js ------- org.jmol.awtjs2d.Mouse
call loadScript J\api\Event.js ------- org.jmol.awtjs2d.Mouse
call loadScript J\awtjs2d\Mouse.js
call loadScript J\api\JmolRendererInterface.js ------- org.jmol.g3d.Graphics3D
call loadScript J\g3d\Graphics3D.js
call loadScript J\g3d\CircleRenderer.js
call loadScript J\g3d\CylinderRenderer.js
call loadScript J\g3d\HermiteRenderer.js
call loadScript J\g3d\ImageRenderer.js
call loadScript J\g3d\LineRenderer.js
call loadScript J\g3d\Pixelator.js
call loadScript J\g3d\PixelatorShaded.js
call loadScript J\g3d\Platform3D.js
call loadScript J\g3d\SphereRenderer.js
call loadScript J\g3d\TextRenderer.js
call loadScript J\g3d\TextSorter.js
call loadScript J\g3d\TextString.js
call loadScript J\util\Rgb16.js ------- org.jmol.g3d.TriangleRenderer
call loadScript J\g3d\TriangleRenderer.js
call loadScript J\api\JmolRepaintManager.js ------- org.jmol.render.RepaintManager
call loadScript J\render\RepaintManager.js
call loadScript J\shape\AtomShape.js ------- org.jmol.shape.Balls
call loadScript J\shape\Balls.js
call loadScript J\shape\Sticks.js
call loadScript J\shape\Measures.js
call loadScript J\shape\FontShape.js ------- org.jmol.shape.FontLineShape
call loadScript J\shape\FontLineShape.js
call loadScript J\shape\Bbcage.js
call loadScript J\shape\Uccage.js
call loadScript J\shape\Frank.js
call loadScript J\render\ShapeRenderer.js ------- org.jmol.render.BallsRenderer
call loadScript J\render\BallsRenderer.js
call loadScript J\render\SticksRenderer.js
call loadScript J\render\FontLineShapeRenderer.js ------- org.jmol.render.MeasuresRenderer
call loadScript J\render\MeasuresRenderer.js
call loadScript J\util\SimpleUnitCell.js
call loadScript J\render\CageRenderer.js ------- org.jmol.render.BbcageRenderer
call loadScript J\render\BbcageRenderer.js
call loadScript J\render\UccageRenderer.js
call loadScript J\render\FrankRenderer.js
call loadScript J\adapter\readers\molxyz\MolReader.js
call loadScript J\adapter\readers\molxyz\XyzReader.js
call loadScript J\shape\Object2dShape.js -- required by org.jmol.shape.TextShape
call loadScript J\shape\TextShape.js -- required by org.jmol.shape.Echo
call loadScript J\shape\Axes.js
call loadScript J\shape\Echo.js
call loadScript J\shape\Text.js
call loadScript J\shape\Halos.js
call loadScript J\shape\Labels.js
call loadScript J\shape\Hover.js
call loadScript J\shape\Mesh.js
call loadScript J\shape\MeshCollection.js
call loadScript J\render\AxesRenderer.js
call loadScript J\render\EchoRenderer.js
call loadScript J\render\TextRenderer.js
call loadScript J\render\HalosRenderer.js
call loadScript J\render\LabelsRenderer.js
call loadScript J\render\HoverRenderer.js
call loadScript J\render\MeshRenderer.js
call loadScript J\exportjs\Export3D.js -- required by org.jmol.exportjs.JSExporter
call loadScript J\exportjs\Exporter.js -- required by org.jmol.exportjs.JSExporter
call loadScript J\exportjs\CartesianExporter.js -- required by org.jmol.exportjs.JSExporter
call loadScript J\exportjs\JSExporter.js
call loadScript J\exportjs\UseTable.js
call loadScript java\io\FileOutputStream.js
call loadScript J\awtjs\Platform.js
call loadScript J\awtjs\Font.js
call loadScript J\awtjs\Image.js
type corebottom.js >> core.js
call setCore core

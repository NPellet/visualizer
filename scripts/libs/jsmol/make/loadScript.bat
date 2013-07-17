if not exist ..\j2s\%1 goto err
echo // > t
echo //// %1 >> t
echo // >> t
type ..\j2s\%1 >> t
type t >> core.js
del t
goto done
:err
echo ..\j2s\%1 does not exist
pause
:done 
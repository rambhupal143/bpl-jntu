Export db using below command:

C:\products\My-products\bpl-jntu\oracle_db_dump>C:\Oracle\product\12.1.0\dbhome_1\BIN\exp bpl/Ganesh_amazon@bplorcl owner=bpl file=bplorcl2019.dmp


---Import (Not tested--verify)
set oracle_sid=ORCL
C:\oracle\ora92\bin\exp SYSTEM/***** full=Y FILE=E:\EXPORTS\EXPORT.dmp log=e:\exports export.log  CONSISTENT=Y
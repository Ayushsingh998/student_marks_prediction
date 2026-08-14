import pandas as pd

df = pd.read_csv('data.csv')
df.head()

from pandas_profiling import ProfileReport
prof = ProfileReport(df)
prof.to_file(output_file='output.html')
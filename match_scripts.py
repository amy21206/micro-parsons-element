import re
regex_input = '\bis\b'
flags = 're.MULTILINE'
source = 'the tree is isadf'

# if flags
# pattern = re.compile(regex_input, )
# if no flags
pattern = re.compile(regex_input)
print([x for x in re.finditer(pattern, source)])

matches = []
m = re.search(pattern, source)
print(m)
offset = 0
while (m):
    if m.start() != m.end():
        matches.append((m.start() + offset, m.end() + offset))
    if m.end() == len(source) or regex_input[0] == '^' or regex_input[0:2] == '\\A':
        break
    if m.start() == m.end():
        source = source[m.end() + 1:]
        offset += 1
    source = source[m.end():]
    offset += m.end()
    m = re.search(pattern, source)
print(matches)

# for match_obj in re.finditer(pattern, source):
#     print(match_obj)
#     match_data = []
#     positive_match_result.append(match_data)
#     for group_id in range(pattern.groups + 1):
#         group_data = {}
#         match_data.append(group_data)
#         group_data['group_id'] = group_id
#         group_data['start'] = match_obj.start(group_id)
#         group_data['end'] = match_obj.end(group_id)
#         group_data['data'] = match_obj.group(group_id)
#     for name, index in pattern.groupindex.items():
#         match_data[index]['name'] = name
# source = negative_test_string
# global negative_match_result
# negative_match_result = []
# for match_obj in re.finditer(pattern, source):
#     match_data = []
#     negative_match_result.append(match_data)
#     for group_id in range(pattern.groups + 1):
#         group_data = {}
#         match_data.append(group_data)
#         group_data['group_id'] = group_id
#         group_data['start'] = match_obj.start(group_id)
#         group_data['end'] = match_obj.end(group_id)
#         group_data['data'] = match_obj.group(group_id)
#     for name, index in pattern.groupindex.items():
#         match_data[index]['name'] = name
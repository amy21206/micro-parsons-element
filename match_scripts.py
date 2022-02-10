# simplified version: only showing the matches, not groups
import re
regex_input = '(abc(de))'
flags = 're.MULTILINE'
source = 'abcdeabcde'

pattern = re.compile(regex_input, re.MULTILINE)
print([x for x in re.finditer(pattern, source)])

matches = []
m = re.search(pattern, source)
has_start_of_line = False
# take out all the parentheses before the first symbol, and see if the symbol is '^'
i = 0
while i < len(regex_input):
    if regex_input[i] != '(':
        # we have found the first symbol
        if regex_input[i] == '^':
            has_start_of_line = True
            break
        else:
            pass
        break
    else:
        if i + 1 < len(regex_input) and regex_input[i + 1] != '?':
            i = i + 1
        elif i + 2 < len(regex_input) and regex_input[i + 2] == ':' or regex_input[i + 2] == '=' or regex_input[i + 2] == '!':

# print(m)
offset = 0
while (m):
    if m.start() != m.end():
        matches.append((m.start() + offset, m.end() + offset))
    if m.end() == len(source) or regex_input[0:2] == '\\A':
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
import urllib.request
import os

logos = {
    "royal_enfield": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Royal_Enfield_Logo.svg/512px-Royal_Enfield_Logo.svg.png",
    "ansys": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Ansys_logo.svg/512px-Ansys_logo.svg.png",
    "easemytrip": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/EaseMyTrip_logo.svg/512px-EaseMyTrip_logo.svg.png",
    "ck_birla": "https://upload.wikimedia.org/wikipedia/en/thumb/8/87/CK_Birla_Group_logo.svg/512px-CK_Birla_Group_logo.svg.png",
    "luminous": "https://cdn.worldvectorlogo.com/logos/luminous-2.svg",
    "hero_electric": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Hero_MotoCorp_Logo.svg/512px-Hero_MotoCorp_Logo.svg.png",
    "altair": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Altair_Engineering_logo.svg/512px-Altair_Engineering_logo.svg.png",
    "smev": "https://www.smev.in/assets/images/logo.png"
}

os.makedirs("public/sponsors", exist_ok=True)
opener = urllib.request.build_opener()
opener.addheaders = [('User-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')]
urllib.request.install_opener(opener)

for name, url in logos.items():
    try:
        ext = url.split('.')[-1]
        if "png" in url:
            ext = "png"
        urllib.request.urlretrieve(url, f"public/sponsors/{name}.{ext}")
        print(f"Downloaded {name}")
    except Exception as e:
        print(f"Failed {name}: {e}")
